#!/usr/bin/python
#
# Copyright 2018 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Modifications made by the University of Stuttgart

import os
import random
import time
import traceback
from concurrent import futures

import googlecloudprofiler
from google.auth.exceptions import DefaultCredentialsError
import grpc

import demo_pb2
import demo_pb2_grpc
from grpc_health.v1 import health_pb2
from grpc_health.v1 import health_pb2_grpc

from opentelemetry import trace
from opentelemetry.instrumentation.grpc import GrpcInstrumentorClient, GrpcInstrumentorServer
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

from logger import getJSONLogger
logger = getJSONLogger('analyticalservice-server')

def initStackdriverProfiling():
  project_id = None
  try:
    project_id = os.environ["GCP_PROJECT_ID"]
  except KeyError:
    # Environment variable not set
    pass

  for retry in range(1,4):
    try:
      if project_id:
        googlecloudprofiler.start(service='analytical_server', service_version='1.0.0', verbose=0, project_id=project_id)
      else:
        googlecloudprofiler.start(service='analytical_server', service_version='1.0.0', verbose=0)
      logger.info("Successfully started Stackdriver Profiler.")
      return
    except (BaseException) as exc:
      logger.info("Unable to start Stackdriver Profiler Python agent. " + str(exc))
      if (retry < 4):
        logger.info("Sleeping %d seconds to retry Stackdriver Profiler agent initialization"%(retry*10))
        time.sleep (1)
      else:
        logger.warning("Could not initialize Stackdriver Profiler after retrying, giving up")
  return

class AnalyticalService(demo_pb2_grpc.RecommendationServiceServicer):
    def Check(self, request, context):
        return health_pb2.HealthCheckResponse(
            status=health_pb2.HealthCheckResponse.SERVING)

    def Watch(self, request, context):
        return health_pb2.HealthCheckResponse(
            status=health_pb2.HealthCheckResponse.UNIMPLEMENTED)



def str2bool(v):
  return v.lower() in ("yes", "true", "t", "1")

if __name__ == "__main__":
    logger.info("initializing analyticalservice")

    try:
      if "DISABLE_PROFILER" in os.environ:
        raise KeyError()
      else:
        logger.info("Profiler enabled.")
        initStackdriverProfiling()
    except KeyError:
        logger.info("Profiler disabled.")

    try:
      grpc_client_instrumentor = GrpcInstrumentorClient()
      grpc_client_instrumentor.instrument()
      grpc_server_instrumentor = GrpcInstrumentorServer()
      grpc_server_instrumentor.instrument()
      if os.environ["ENABLE_TRACING"] == "1":
        trace.set_tracer_provider(TracerProvider())
        otel_endpoint = os.getenv("COLLECTOR_SERVICE_ADDR", "localhost:4317")
        trace.get_tracer_provider().add_span_processor(
          BatchSpanProcessor(
              OTLPSpanExporter(
              endpoint = otel_endpoint,
              insecure = True
            )
          )
        )
    except (KeyError, DefaultCredentialsError):
        logger.info("Tracing disabled.")
    except Exception as e:
        logger.warn(f"Exception on Cloud Trace setup: {traceback.format_exc()}, tracing disabled.") 

    # connect to checkout service
    checkout_addr = os.environ.get('CHECKOUT_SERVICE_ADDR', '')
    checkout_secure = str2bool(os.environ.get('CHECKOUT_SERVICE_SECURE', ''))
    if checkout_addr == "":
        raise Exception('CHECKOUT_SERVICE_ADDR environment variable not set')
    logger.info("checkout address: " + checkout_addr + " (" + str(checkout_secure) + ")")
    checkout_channel = grpc.insecure_channel(checkout_addr)
    if checkout_secure:
      checkout_channel = grpc.secure_channel(checkout_addr, grpc.ssl_channel_credentials())       
    checkout_stub = demo_pb2_grpc.CheckoutServiceStub(checkout_channel)

    # connect to recommendation service
    recommendation_addr = os.environ.get('RECOMMENDATION_SERVICE_ADDR', '')
    recommendation_secure = str2bool(os.environ.get('RECOMMENDATION_SERVICE_SECURE', ''))
    if recommendation_addr == "":
        raise Exception('RECOMMENDATION_SERVICE_ADDR environment variable not set')
    logger.info("recommendation address: " + recommendation_addr + " (" + str(recommendation_secure) + ")")
    recommendation_channel = grpc.insecure_channel(recommendation_addr)
    if recommendation_secure:
      recommendation_channel = grpc.secure_channel(recommendation_addr, grpc.ssl_channel_credentials())       
    recommendation_stub = demo_pb2_grpc.CheckoutServiceStub(recommendation_channel)

    # create gRPC server
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))

    # add class to gRPC server
    service = AnalyticalService()
    health_pb2_grpc.add_HealthServicer_to_server(service, server)

    # start server
    port = os.environ.get('PORT', "8080")
    logger.info("listening on port: " + port)
    server.add_insecure_port('[::]:'+port)
    server.start()

    # keep alive
    try:
         while True:
            time.sleep(10000)
    except KeyboardInterrupt:
            server.stop(0)
