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

###################################################
#
# Currency
#
###################################################

resource "google_cloud_run_v2_service" "currency" {
  name     = "currency"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
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
  }
}

resource "google_cloud_run_service_iam_binding" "currency" {
  location = google_cloud_run_v2_service.currency.location
  service  = google_cloud_run_v2_service.currency.name
  role     = "roles/run.invoker"
  members = [
    "allUsers"
  ]
}


###################################################
#
# Product
#
###################################################

resource "google_cloud_run_v2_service" "product" {
  name     = "product"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "gcr.io/google-samples/microservices-demo/productcatalogservice:v0.10.1"

      ports {
        name           = "h2c"
        container_port = 7000
      }

      env {
        name  = "DISABLE_PROFILER"
        value = "1"
      }
    }
  }
}

resource "google_cloud_run_service_iam_binding" "product" {
  location = google_cloud_run_v2_service.product.location
  service  = google_cloud_run_v2_service.product.name
  role     = "roles/run.invoker"
  members = [
    "allUsers"
  ]
}


###################################################
#
# Checkout
#
###################################################

resource "google_cloud_run_v2_service" "checkout" {
  name     = "checkout"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "milesstoetzner/boutique-checkout:latest"

      ports {
        name           = "h2c"
        container_port = 7000
      }

      env {
        name  = "PRODUCT_CATALOG_SERVICE_ADDR"
        value = "${substr(google_cloud_run_v2_service.product.uri, 8, -1)}:443"
      }

      env {
        name  = "PRODUCT_CATALOG_SERVICE_SECURE"
        value = "1"
      }

      env {
        name  = "CURRENCY_SERVICE_ADDR"
        value = "${substr(google_cloud_run_v2_service.currency.uri, 8, -1)}:443"
      }

      env {
        name  = "CURRENCY_SERVICE_SECURE"
        value = "1"
      }

      env {
        name  = "CART_SERVICE_ADDR"
        value = "${substr(google_cloud_run_v2_service.cart.uri, 8, -1)}:443"
      }

      env {
        name  = "CART_SERVICE_SECURE"
        value = "1"
      }

      env {
        name  = "SHIPPING_SERVICE_ADDR"
        value = "${substr(google_cloud_run_v2_service.shipping.uri, 8, -1)}:443"
      }

      env {
        name  = "SHIPPING_SERVICE_SECURE"
        value = "1"
      }

      env {
        name  = "EMAIL_SERVICE_ADDR"
        value = "${substr(google_cloud_run_v2_service.email.uri, 8, -1)}:443"
      }

      env {
        name  = "EMAIL_SERVICE_SECURE"
        value = "1"
      }

      env {
        name  = "PAYMENT_SERVICE_ADDR"
        value = "${substr(google_cloud_run_v2_service.payment.uri, 8, -1)}:443"
      }

      env {
        name  = "PAYMENT_SERVICE_SECURE"
        value = "1"
      }

      env {
        name  = "DISABLE_PROFILER"
        value = "1"
      }
    }
  }

}
resource "google_cloud_run_service_iam_binding" "checkout" {
  location = google_cloud_run_v2_service.checkout.location
  service  = google_cloud_run_v2_service.checkout.name
  role     = "roles/run.invoker"
  members = [
    "allUsers"
  ]
}


###################################################
#
# Shipping
#
###################################################

resource "google_cloud_run_v2_service" "shipping" {
  name     = "shipping"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "gcr.io/google-samples/microservices-demo/shippingservice:v0.10.1"

      ports {
        name           = "h2c"
        container_port = 7000
      }

      env {
        name  = "DISABLE_PROFILER"
        value = "1"
      }
    }
  }
}

resource "google_cloud_run_service_iam_binding" "shipping" {
  location = google_cloud_run_v2_service.shipping.location
  service  = google_cloud_run_v2_service.shipping.name
  role     = "roles/run.invoker"
  members = [
    "allUsers"
  ]
}


###################################################
#
# Cart
#
###################################################

resource "google_cloud_run_v2_service" "cart" {
  name     = "cart"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "milesstoetzner/boutique-cart:v3"

      ports {
        name           = "h2c"
        container_port = 7070
      }

      env {
        name = "MYSQL_HOST"
        value = google_sql_database_instance.dbms.public_ip_address
      }

      env {
        name = "MYSQL_PORT"
        value = "3306"
      }

      env {
        name = "MYSQL_DATABASE"
        value = "cart"
      }

      env {
        name = "MYSQL_USER"
        value = "root"
      }

      env {
        name = "MYSQL_PASSWORD"
        value = "password"
      }

      env {
        name = "MYSQL_TABLE"
        value = "carts"
      }

      env {
        name = "MYSQL_SSL_MODE"
        value = "Preferred"
      }

      env {
        name  = "DISABLE_PROFILER"
        value = "1"
      }
    }
  }
}

resource "google_cloud_run_service_iam_binding" "cart" {
  location = google_cloud_run_v2_service.cart.location
  service  = google_cloud_run_v2_service.cart.name
  role     = "roles/run.invoker"
  members = [
    "allUsers"
  ]
}

# https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/sql_database_instance
resource "google_sql_database_instance" "dbms" {
  name             = "boutique-dbms"
  database_version = "MYSQL_5_7"
  root_password = "password"
  deletion_protection = false

  settings {
    tier = "db-f1-micro"

    availability_type = "REGIONAL"

    backup_configuration {
      enabled = true
      binary_log_enabled = true
    }

    ip_configuration {
      ipv4_enabled = true

      authorized_networks {
        name = "public"
        value = "0.0.0.0/0"
      }
    }
  }
}

resource "google_sql_database" "database" {
  name     = "cart"
  instance = google_sql_database_instance.dbms.name
}

resource "google_sql_user" "users" {
  name     = "root"
  instance = google_sql_database_instance.dbms.name
  host     = "%"
  password = "password"
}


###################################################
#
# Email
#
###################################################

resource "google_cloud_run_v2_service" "email" {
  name     = "email"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "gcr.io/google-samples/microservices-demo/emailservice:v0.10.1"

      ports {
        name           = "h2c"
        container_port = 7000
      }

      env {
        name  = "DISABLE_PROFILER"
        value = "1"
      }
    }
  }
}

resource "google_cloud_run_service_iam_binding" "email" {
  location = google_cloud_run_v2_service.email.location
  service  = google_cloud_run_v2_service.email.name
  role     = "roles/run.invoker"
  members = [
    "allUsers"
  ]
}


###################################################
#
# Payment
#
###################################################

resource "google_cloud_run_v2_service" "payment" {
  name     = "payment"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "milesstoetzner/boutique-payment:latest"

      ports {
        name           = "h2c"
        container_port = 7000
      }

      env {
        name  = "OPTIONAL_PAYMENT_FEATURE"
        value = "1"
      }

      env {
        name  = "PREMIUM_PAYMENT_FEATURE"
        value = "0"
      }

      env {
        name  = "DISABLE_PROFILER"
        value = "1"
      }
    }
  }
}

resource "google_cloud_run_service_iam_binding" "payment" {
  location = google_cloud_run_v2_service.payment.location
  service  = google_cloud_run_v2_service.payment.name
  role     = "roles/run.invoker"
  members = [
    "allUsers"
  ]
}


###################################################
#
# Frontend
#
###################################################

resource "google_cloud_run_v2_service" "frontend" {
  name     = "frontend"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "milesstoetzner/boutique-frontend:latest"

      env {
        name  = "PRODUCT_CATALOG_SERVICE_ADDR"
        value = "${substr(google_cloud_run_v2_service.product.uri, 8, -1)}:443"
      }

      env {
        name  = "PRODUCT_CATALOG_SERVICE_SECURE"
        value = "1"
      }

      env {
        name  = "CURRENCY_SERVICE_ADDR"
        value = "${substr(google_cloud_run_v2_service.currency.uri, 8, -1)}:443"
      }

      env {
        name  = "CURRENCY_SERVICE_SECURE"
        value = "1"
      }

      env {
        name  = "CART_SERVICE_ADDR"
        value = "${substr(google_cloud_run_v2_service.cart.uri, 8, -1)}:443"
      }

      env {
        name  = "CART_SERVICE_SECURE"
        value = "1"
      }

      env {
        name  = "RECOMMENDATION_SERVICE_ADDR"
        value = "${substr(google_cloud_run_v2_service.recommendation.uri, 8, -1)}:443"
      }

      env {
        name  = "RECOMMENDATION_SERVICE_SECURE"
        value = "1"
      }

      env {
        name  = "SHIPPING_SERVICE_ADDR"
        value = "${substr(google_cloud_run_v2_service.shipping.uri, 8, -1)}:443"
      }

      env {
        name  = "SHIPPING_SERVICE_SECURE"
        value = "1"
      }

      env {
        name  = "CHECKOUT_SERVICE_ADDR"
        value = "${substr(google_cloud_run_v2_service.checkout.uri, 8, -1)}:443"
      }

      env {
        name  = "CHECKOUT_SERVICE_SECURE"
        value = "1"
      }

      env {
        name  = "AD_SERVICE_ADDR"
        value = "${substr(google_cloud_run_v2_service.advertisement.uri, 8, -1)}:443"
      }

      env {
        name  = "AD_SERVICE_SECURE"
        value = "1"
      }

      env {
        name  = "SHOPPING_ASSISTANT_SERVICE_ADDR"
        value = "shoppingassistantservice"
      }

      env {
        name  = "ENABLE_PROFILER"
        value = "0"
      }

      env {
        name  = "ENV_PLATFORM"
        value = "gcp"
      }

      env {
        name  = "OPTIONAL_PAYMENT_FEATURE"
        value = "1"
      }

      env {
        name  = "PREMIUM_PAYMENT_FEATURE"
        value = "0"
      }
    }
  }
}

resource "google_cloud_run_service_iam_binding" "frontend" {
  location = google_cloud_run_v2_service.frontend.location
  service  = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  members = [
    "allUsers"
  ]
}



###################################################
#
# Recommendation
#
###################################################

resource "google_cloud_run_v2_service" "recommendation" {
  name     = "recommendation"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "milesstoetzner/boutique-recommendation:latest"

      ports {
        name           = "h2c"
        container_port = 7000
      }

      env {
        name  = "PRODUCT_CATALOG_SERVICE_ADDR"
        value = "${substr(google_cloud_run_v2_service.product.uri, 8, -1)}:443"
      }

      env {
        name  = "PRODUCT_CATALOG_SERVICE_SECURE"
        value = "1"
      }

      env {
        name  = "DISABLE_PROFILER"
        value = "1"
      }
    }
  }
}

resource "google_cloud_run_service_iam_binding" "recommendation" {
  location = google_cloud_run_v2_service.recommendation.location
  service  = google_cloud_run_v2_service.recommendation.name
  role     = "roles/run.invoker"
  members = [
    "allUsers"
  ]
}


###################################################
#
# Advertisement
#
###################################################

resource "google_cloud_run_v2_service" "advertisement" {
  name     = "advertisement"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "gcr.io/google-samples/microservices-demo/adservice:v0.10.1"

      ports {
        name           = "h2c"
        container_port = 7000
      }

      env {
        name  = "DISABLE_PROFILER"
        value = "1"
      }
    }
  }
}

resource "google_cloud_run_service_iam_binding" "advertisement" {
  location = google_cloud_run_v2_service.advertisement.location
  service  = google_cloud_run_v2_service.advertisement.name
  role     = "roles/run.invoker"
  members = [
    "allUsers"
  ]
}



###################################################
#
# Analytics
#
###################################################

resource "google_cloud_run_v2_service" "analytics" {
  name     = "analytics"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "milesstoetzner/boutique-analytics:latest"


      ports {
        name           = "h2c"
        container_port = 7000
      }

      env {
        name  = "CHECKOUT_SERVICE_ADDR"
        value = "${substr(google_cloud_run_v2_service.checkout.uri, 8, -1)}:443"
      }

      env {
        name  = "CHECKOUT_SERVICE_SECURE"
        value = "1"
      }

      env {
        name  = "RECOMMENDATION_SERVICE_ADDR"
        value = "${substr(google_cloud_run_v2_service.recommendation.uri, 8, -1)}:443"
      }

      env {
        name  = "RECOMMENDATION_SERVICE_SECURE"
        value = "1"
      }

      env {
        name  = "DISABLE_PROFILER"
        value = "1"
      }
    }
  }
}

resource "google_cloud_run_service_iam_binding" "analytics" {
  location = google_cloud_run_v2_service.analytics.location
  service  = google_cloud_run_v2_service.analytics.name
  role     = "roles/run.invoker"
  members = [
    "allUsers"
  ]
}

