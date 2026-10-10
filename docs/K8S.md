# SphereShop — Kubernetes Architecture & Deployment Guide

This document describes the Kubernetes manifests and scaling configuration for SphereShop in UAT / Production.

---

## 1. Architecture Overview
- **Namespace**: `sphereshop`
- **ConfigMap & Secret**: Centralized configuration (`sphereshop-config`) and secrets template (`sphereshop-secret`).
- **PostgreSQL**: `StatefulSet` with persistent volume claim (`PVC 10Gi`) mounted at `/var/lib/postgresql/data`.
- **Redis**: Deployment + ClusterIP Service for session caching and stock reservation TTLs.
- **API Deployment**: `sphereshop-api` Deployment configured with **min 2 replicas**, scaling to **4 replicas** via HorizontalPodAutoscaler.
- **Storefront Web Deployment**: `sphereshop-web` serving Nginx static assets and proxying `/api/v1` traffic.
- **Ingress**: NGINX Ingress controller with TLS termination routing traffic to `sphereshop-web`.

---

## 2. Manifest Directory Structure (`/k8s`)
- `api-deployment.yaml`: API Deployment & ClusterIP Service (port 3000).
- `postgres-statefulset.yaml`: PostgreSQL 16 StatefulSet + Service + 10Gi PVC.
- `hpa.yaml`: HorizontalPodAutoscaler scaling `sphereshop-api` (min 2, max 4 replicas at 80% CPU).

---

## 3. Verification Commands

### Apply Manifests
```bash
kubectl apply -f k8s/ --dry-run=client
kubectl create namespace sphereshop
kubectl apply -f k8s/ -n sphereshop
```

### Scale API Replicas to 4
```bash
kubectl scale deployment/sphereshop-api --replicas=4 -n sphereshop
kubectl get pods -l app=sphereshop-api -n sphereshop
# Output: 4/4 pods Ready
```
