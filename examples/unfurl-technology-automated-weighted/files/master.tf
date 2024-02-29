variable "ssh_user" {
  type = string
}

variable "ssh_key_file" {
  type = string
}

variable "ssh_host" {
  type = string
}

variable "application_name" {
  type = string
}

variable "application_script" {
  type = string
}

variable "application_artifact" {
  type = string
}

variable "db_dialect" {
  type = string
}

variable "db_name" {
  type = string
}

variable "db_username" {
  type = string
}

variable "db_password" {
  type = string
}

variable "db_address" {
  type = string
}

resource "terraform_data" "os" {

  connection {
    type        = "ssh"
    user        = var.ssh_user
    private_key = file(var.ssh_key_file)
    host        = var.ssh_host
  }

  provisioner "file" {
    source      = var.application_artifact
    destination = "/tmp/shop.tar.gz"
  }

  provisioner "file" {
    source      = var.application_script
    destination = "/tmp/shop.create.sh"
  }

  provisioner "remote-exec" {
    inline = [
      "sudo /tmp/shop.create.sh ${var.application_name} /tmp/shop.tar.gz ${var.db_dialect} ${var.db_name} ${var.db_username} ${var.db_password} ${var.db_address}",
    ]
  }
}
