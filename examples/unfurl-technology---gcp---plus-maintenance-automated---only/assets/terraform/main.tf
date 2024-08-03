terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "5.39.1"
    }
  }
}

provider "google" {
  project     = var.project
  region      = var.region
  credentials = var.credentials
}

variable "credentials" {
  type    = string
  default = "/home/stoetzms/gcp/stoetzms-387808-2ec1cf865c76.json"
}

variable "project" {
  type    = string
  default = "stoetzms-387808"
}

variable "region" {
  type    = string
  default = "europe-west3"
}

resource "google_cloud_run_v2_service" "frontend" {
  name     = "frontend"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    scaling {
      min_instance_count = 1
      max_instance_count = 1
    }

    containers {
      name  = "frontend"
      image = "gcr.io/google-samples/microservices-demo/frontend:v0.10.1"

      env {
        name  = "PRODUCT_CATALOG_SERVICE_ADDR"
        value = "productcatalogservice:3550"
      }

      env {
        name  = "CURRENCY_SERVICE_ADDR"
        value = "${substr(google_cloud_run_v2_service.currency.uri, 8, -1)}:443"
      }

      env {
        name  = "CART_SERVICE_ADDR"
        value = "cartservice"
      }

      env {
        name  = "RECOMMENDATION_SERVICE_ADDR"
        value = "recommendationservice"
      }

      env {
        name  = "SHIPPING_SERVICE_ADDR"
        value = "shippingservice"
      }

      env {
        name  = "CHECKOUT_SERVICE_ADDR"
        value = "checkoutservice"
      }

      env {
        name  = "AD_SERVICE_ADDR"
        value = "adservice"
      }

      env {
        name  = "SHOPPING_ASSISTANT_SERVICE_ADDR"
        value = "shoppingassistantservice"
      }

      env {
        name  = "ENABLE_PROFILER"
        value = "0"
      }
    }

    vpc_access {
      connector = google_vpc_access_connector.shop.id
      egress    = "ALL_TRAFFIC"
    }
  }
}

resource "google_cloud_run_service_iam_binding" "frontend-public" {
  location = google_cloud_run_v2_service.frontend.location
  service  = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  members = [
    "allUsers"
  ]
}

resource "google_cloud_run_v2_service" "currency" {
  name     = "currency"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_INTERNAL_ONLY"

  template {
    scaling {
      min_instance_count = 1
      max_instance_count = 1
    }

    containers {
      image = "gcr.io/google-samples/microservices-demo/currencyservice:v0.10.1"

      ports {
        name           = "h2c"
        container_port = 7000
      }

      env {
        name  = "DISABLE_PROFILER"
        value = "1"
      }
    }

    vpc_access {
      connector = google_vpc_access_connector.shop.id
      egress    = "ALL_TRAFFIC"
    }

  }
}

resource "google_cloud_run_service_iam_binding" "currency-public" {
  location = google_cloud_run_v2_service.currency.location
  service  = google_cloud_run_v2_service.currency.name
  role     = "roles/run.invoker"
  members = [
    "allUsers"
  ]
}

resource "google_vpc_access_connector" "shop" {
  name = "run-vpc"
  subnet {
    name = google_compute_subnetwork.shop.name
  }
  min_instances = 2
  max_instances = 3
  region        = var.region
}

resource "google_compute_subnetwork" "shop" {
  name          = "run-subnetwork"
  ip_cidr_range = "10.2.0.0/28"
  region        = var.region
  network       = google_compute_network.shop.id
}

resource "google_compute_network" "shop" {
  name                    = "run-network"
  auto_create_subnetworks = false
}

resource "google_project_service" "vpcaccess-api" {
  project = var.project
  service = "vpcaccess.googleapis.com"
}
