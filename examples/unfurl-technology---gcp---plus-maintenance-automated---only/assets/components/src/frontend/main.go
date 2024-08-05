// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Modifications made by University of Stuttgart

package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"time"

	"cloud.google.com/go/profiler"
	"github.com/gorilla/mux"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/propagation"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"crypto/tls"
	"crypto/x509"
	"strconv"
)

const (
	port            = "8080"
	defaultCurrency = "USD"
	cookieMaxAge    = 60 * 60 * 48

	cookiePrefix    = "shop_"
	cookieSessionID = cookiePrefix + "session-id"
	cookieCurrency  = cookiePrefix + "currency"
)

var (
	whitelistedCurrencies = map[string]bool{
		"USD": true,
		"EUR": true,
		"CAD": true,
		"JPY": true,
		"GBP": true,
		"TRY": true,
	}

	baseUrl         = ""
)

type ctxKeySessionID struct{}

type frontendServer struct {
	productCatalogSvcAddr string
	productCatalogSvcConn *grpc.ClientConn
	productCatalogSvcSecure bool

	currencySvcAddr string
	currencySvcConn *grpc.ClientConn
	currencySvcSecure bool

	cartSvcAddr string
	cartSvcConn *grpc.ClientConn
	cartSvcSecure bool

	recommendationSvcAddr string
	recommendationSvcConn *grpc.ClientConn
	recommendationSvcSecure bool

	checkoutSvcAddr string
	checkoutSvcConn *grpc.ClientConn
	checkoutSvcSecure bool

	shippingSvcAddr string
	shippingSvcConn *grpc.ClientConn
	shippingSvcSecure bool

	adSvcAddr string
	adSvcConn *grpc.ClientConn
	adSvcSecure bool

	collectorAddr string
	collectorConn *grpc.ClientConn

	shoppingAssistantSvcAddr string
}

func main() {
	ctx := context.Background()
	log := logrus.New()
	log.Level = logrus.DebugLevel
	log.Formatter = &logrus.JSONFormatter{
		FieldMap: logrus.FieldMap{
			logrus.FieldKeyTime:  "timestamp",
			logrus.FieldKeyLevel: "severity",
			logrus.FieldKeyMsg:   "message",
		},
		TimestampFormat: time.RFC3339Nano,
	}
	log.Out = os.Stdout

	svc := new(frontendServer)

	otel.SetTextMapPropagator(
		propagation.NewCompositeTextMapPropagator(
			propagation.TraceContext{}, propagation.Baggage{}))

	baseUrl = os.Getenv("BASE_URL")

	if os.Getenv("ENABLE_TRACING") == "1" {
		log.Info("Tracing enabled.")
		initTracing(log, ctx, svc)
	} else {
		log.Info("Tracing disabled.")
	}

	if os.Getenv("ENABLE_PROFILER") == "1" {
		log.Info("Profiling enabled.")
		go initProfiling(log, "frontend", "1.0.0")
	} else {
		log.Info("Profiling disabled.")
	}

	srvPort := port
	if os.Getenv("PORT") != "" {
		srvPort = os.Getenv("PORT")
	}
	addr := os.Getenv("LISTEN_ADDR")
	mustMapEnvString(&svc.productCatalogSvcAddr, "PRODUCT_CATALOG_SERVICE_ADDR")
	mustMapEnvBool(&svc.productCatalogSvcSecure, "PRODUCT_CATALOG_SERVICE_SECURE")

	mustMapEnvString(&svc.currencySvcAddr, "CURRENCY_SERVICE_ADDR")
	mustMapEnvBool(&svc.currencySvcSecure, "CURRENCY_SERVICE_SECURE")

	mustMapEnvString(&svc.cartSvcAddr, "CART_SERVICE_ADDR")
	mustMapEnvBool(&svc.cartSvcSecure, "CART_SERVICE_SECURE")
	
	mustMapEnvString(&svc.recommendationSvcAddr, "RECOMMENDATION_SERVICE_ADDR")
	mustMapEnvBool(&svc.recommendationSvcSecure, "RECOMMENDATION_SERVICE_SECURE")
	
	mustMapEnvString(&svc.checkoutSvcAddr, "CHECKOUT_SERVICE_ADDR")
	mustMapEnvBool(&svc.checkoutSvcSecure, "CHECKOUT_SERVICE_SECURE")
	
	mustMapEnvString(&svc.shippingSvcAddr, "SHIPPING_SERVICE_ADDR")
	mustMapEnvBool(&svc.shippingSvcSecure, "SHIPPING_SERVICE_SECURE")
	
	mustMapEnvString(&svc.adSvcAddr, "AD_SERVICE_ADDR")
	mustMapEnvBool(&svc.adSvcSecure, "AD_SERVICE_SECURE")

	mustMapEnvString(&svc.shoppingAssistantSvcAddr, "SHOPPING_ASSISTANT_SERVICE_ADDR")

	mustConnGRPC(ctx, &svc.currencySvcConn, svc.currencySvcAddr, svc.currencySvcSecure)
	mustConnGRPC(ctx, &svc.productCatalogSvcConn, svc.productCatalogSvcAddr, svc.productCatalogSvcSecure)
	mustConnGRPC(ctx, &svc.cartSvcConn, svc.cartSvcAddr, svc.cartSvcSecure)
	mustConnGRPC(ctx, &svc.recommendationSvcConn, svc.recommendationSvcAddr, svc.recommendationSvcSecure)
	mustConnGRPC(ctx, &svc.shippingSvcConn, svc.shippingSvcAddr, svc.shippingSvcSecure)
	mustConnGRPC(ctx, &svc.checkoutSvcConn, svc.checkoutSvcAddr, svc.checkoutSvcSecure)
	mustConnGRPC(ctx, &svc.adSvcConn, svc.adSvcAddr, svc.adSvcSecure)

	r := mux.NewRouter()
	r.HandleFunc(baseUrl + "/", svc.homeHandler).Methods(http.MethodGet, http.MethodHead)
	r.HandleFunc(baseUrl + "/product/{id}", svc.productHandler).Methods(http.MethodGet, http.MethodHead)
	r.HandleFunc(baseUrl + "/cart", svc.viewCartHandler).Methods(http.MethodGet, http.MethodHead)
	r.HandleFunc(baseUrl + "/cart", svc.addToCartHandler).Methods(http.MethodPost)
	r.HandleFunc(baseUrl + "/cart/empty", svc.emptyCartHandler).Methods(http.MethodPost)
	r.HandleFunc(baseUrl + "/setCurrency", svc.setCurrencyHandler).Methods(http.MethodPost)
	r.HandleFunc(baseUrl + "/logout", svc.logoutHandler).Methods(http.MethodGet)
	r.HandleFunc(baseUrl + "/cart/checkout", svc.placeOrderHandler).Methods(http.MethodPost)
	r.HandleFunc(baseUrl + "/assistant", svc.assistantHandler).Methods(http.MethodGet)
	r.PathPrefix(baseUrl + "/static/").Handler(http.StripPrefix(baseUrl + "/static/", http.FileServer(http.Dir("./static/"))))
	r.HandleFunc(baseUrl + "/robots.txt", func(w http.ResponseWriter, _ *http.Request) { fmt.Fprint(w, "User-agent: *\nDisallow: /") })
	r.HandleFunc(baseUrl + "/_healthz", func(w http.ResponseWriter, _ *http.Request) { fmt.Fprint(w, "ok") })
	r.HandleFunc(baseUrl + "/product-meta/{ids}", svc.getProductByID).Methods(http.MethodGet)
	r.HandleFunc(baseUrl + "/bot", svc.chatBotHandler).Methods(http.MethodPost)

	var handler http.Handler = r
	handler = &logHandler{log: log, next: handler}     // add logging
	handler = ensureSessionID(handler)                 // add session ID
	handler = otelhttp.NewHandler(handler, "frontend") // add OTel tracing

	log.Infof("starting server on " + addr + ":" + srvPort)
	log.Fatal(http.ListenAndServe(addr+":"+srvPort, handler))
}
func initStats(log logrus.FieldLogger) {
	// TODO(arbrown) Implement OpenTelemtry stats
}

func initTracing(log logrus.FieldLogger, ctx context.Context, svc *frontendServer) (*sdktrace.TracerProvider, error) {
	mustMapEnvString(&svc.collectorAddr, "COLLECTOR_SERVICE_ADDR")
	mustConnGRPC(ctx, &svc.collectorConn, svc.collectorAddr, false)
	exporter, err := otlptracegrpc.New(
		ctx,
		otlptracegrpc.WithGRPCConn(svc.collectorConn))
	if err != nil {
		log.Warnf("warn: Failed to create trace exporter: %v", err)
	}
	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exporter),
		sdktrace.WithSampler(sdktrace.AlwaysSample()))
	otel.SetTracerProvider(tp)

	return tp, err
}

func initProfiling(log logrus.FieldLogger, service, version string) {
	// TODO(ahmetb) this method is duplicated in other microservices using Go
	// since they are not sharing packages.
	for i := 1; i <= 3; i++ {
		log = log.WithField("retry", i)
		if err := profiler.Start(profiler.Config{
			Service:        service,
			ServiceVersion: version,
			// ProjectID must be set if not running on GCP.
			// ProjectID: "my-project",
		}); err != nil {
			log.Warnf("warn: failed to start profiler: %+v", err)
		} else {
			log.Info("started Stackdriver profiler")
			return
		}
		d := time.Second * 10 * time.Duration(i)
		log.Debugf("sleeping %v to retry initializing Stackdriver profiler", d)
		time.Sleep(d)
	}
	log.Warn("warning: could not initialize Stackdriver profiler after retrying, giving up")
}

func mustMapEnvString(target *string, envKey string) {
	v := os.Getenv(envKey)
	if v == "" {
		panic(fmt.Sprintf("environment variable %q not set", envKey))
	}

	*target = v
}

func mustMapEnvBool(target *bool, envKey string) {
	v := os.Getenv(envKey)
	if v == "" {
		panic(fmt.Sprintf("environment variable %q not set", envKey))
	}

	b, err := strconv.ParseBool(v)
	if err != nil {
		panic(errors.Wrapf(err, "environment variable %s holds non-boolean value %s", envKey, v))
	}

	*target = b
}

func mustConnGRPC(ctx context.Context, conn **grpc.ClientConn, addr string, secure bool) {
	var err error
	ctx, cancel := context.WithTimeout(ctx, time.Second*3)
	defer cancel()
	
	systemRoots, err := x509.SystemCertPool()
	cred := credentials.NewTLS(&tls.Config{
		RootCAs: systemRoots,
	})
	if err != nil {
		panic(errors.Wrapf(err, "grpc: failed to load x509 system cert pool"))
	}

	opts := []grpc.DialOption{
		grpc.WithUnaryInterceptor(otelgrpc.UnaryClientInterceptor()),
		grpc.WithStreamInterceptor(otelgrpc.StreamClientInterceptor()),
	}

	if secure {
		opts = append(opts, grpc.WithTransportCredentials(cred))
	} else {
		opts = append(opts, grpc.WithInsecure())
	}
	
	*conn, err = grpc.DialContext(ctx, addr, opts...)
	if err != nil {
		panic(errors.Wrapf(err, "grpc: failed to connect %s", addr))
	}

}
