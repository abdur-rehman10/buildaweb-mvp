# AWS EC2 IP Deployment Guide (Buildaweb)

This guide describes a reproducible IP-based deployment baseline for Buildaweb using Docker Compose.

## 1) EC2 Prerequisites
- Ubuntu 22.04/24.04 EC2 instance
- SSH key pair configured
- Public IPv4 assigned
- Security Group configured as below

## 2) Security Group Inbound Rules
Use these inbound rules on the EC2 instance security group:

- `22` (SSH) from `MY_IP/32`
- `80` (HTTP) from `0.0.0.0/0`
- `443` (HTTPS) from `0.0.0.0/0` (optional)
- `9000` (MinIO API) from `0.0.0.0/0` (optional public access)
- `9001` (MinIO Console) from `MY_IP/32` only

## 3) Install Docker + Compose Plugin
Run on EC2:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

## 4) Clone Repository via SSH

```bash
git clone git@github.com:<YOUR_ORG_OR_USER>/buildaweb-mvp.git
cd buildaweb-mvp
```

## 5) Prepare Production Environment File

```bash
cp .env.prod.example .env.prod
```

Update `.env.prod` values (no real secrets committed):
- `JWT_SECRET` to a strong random value
- `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY`
- `MINIO_PUBLIC_BASE_URL=http://<PUBLIC_IP>:9000`

## 6) Start Production Stack

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

## 7) Verification Checks

```bash
# Web should respond
curl -i http://localhost/ | head

# API should be reachable through /api and return auth error (not 404)
curl -i http://localhost/api/v1/auth/me | head

# Public IP check from local machine
curl -I http://<PUBLIC_IP>
```

Expected behavior:
- `http://localhost/` -> `200`
- `http://localhost/api/v1/auth/me` -> `401` (or `403` depending auth middleware), but **not** `404`

## 8) Troubleshooting

- **"connection reset by peer" on `http://<PUBLIC_IP>`**
  - Usually security group is missing inbound port `80`.
  - Ensure EC2 SG allows `80` from `0.0.0.0/0`.

- **`/api/v1/...` returns `404` through proxy**
  - Caddy config likely used `handle_path /api/*`, which strips `/api` and breaks `/api/v1` routes.
  - Use `handle /api/* { reverse_proxy api:4000 }`.

- **Port `9000` already allocated**
  - Another container/process is using it.
  - Stop old containers and restart stack:
    ```bash
    docker compose -f docker-compose.prod.yml --env-file .env.prod down
    docker ps -a
    docker stop <conflicting_container>
    docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
    ```
