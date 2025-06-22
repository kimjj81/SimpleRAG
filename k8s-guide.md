# Minikube와 ArgoCD를 이용한 로컬 Kubernetes 배포 가이드

이 문서는 Minikube와 ArgoCD를 사용하여 로컬 환경에서 웹 애플리케이션을 Kubernetes에 배포하는 과정을 안내합니다.

## 목차

1.  [사전 준비](#1-사전-준비)
2.  [Minikube 클러스터 시작](#2-minikube-클러스터-시작)
3.  [ArgoCD 설치 및 설정](#3-argocd-설치-및-설정)
4.  [애플리케이션 컨테이너화](#4-애플리케이션-컨테이너화)
5.  [Kubernetes Manifest 작성](#5-kubernetes-manifest-작성)
6.  [ArgoCD를 통한 배포](#6-argocd를-통한-배포)

---

## 1. 사전 준비

배포를 진행하기 전, 다음 도구들이 시스템에 설치되어 있어야 합니다.

*   **Docker:** 컨테이너 이미지 빌드 및 관리를 위해 필요합니다.
*   **kubectl:** Kubernetes 클러스터와 통신하기 위한 커맨드 라인 도구입니다.
*   **Minikube:** 로컬 환경에 단일 노드 Kubernetes 클러스터를 생성하는 도구입니다.

## 2. Minikube 클러스터 시작

다음 명령어를 사용하여 Minikube 클러스터를 시작합니다.

```bash
minikube start
```

이 명령은 로컬에 Kubernetes 클러스터를 생성하고 `kubectl`이 해당 클러스터를 사용하도록 자동으로 설정합니다.

## 3. ArgoCD 설치 및 설정

1.  **ArgoCD 네임스페이스 생성:**

    ```bash
    kubectl create namespace argocd
    ```

2.  **ArgoCD 설치:**

    ArgoCD 공식 Manifest 파일을 사용하여 클러스터에 설치합니다.

    ```bash
    kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
    ```

3.  **ArgoCD 서버 접속:**

    ArgoCD 서버는 기본적으로 외부로 노출되어 있지 않으므로, 포트 포워딩을 사용하여 로컬에서 접속합니다. **새로운 터미널**을 열고 다음 명령어를 실행하세요.

    ```bash
    kubectl port-forward svc/argocd-server -n argocd 8080:443
    ```

4.  **ArgoCD UI 로그인:**

    웹 브라우저에서 `https://localhost:8080` 주소로 접속합니다. (보안 경고가 표시될 수 있으며, 무시하고 진행해도 안전합니다.)

    *   **사용자 이름:** `admin`
    *   **비밀번호:** 다음 명령어를 실행하여 초기 관리자 비밀번호를 확인합니다.

        ```bash
        kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
        ```

## 4. 애플리케이션 컨테이너화

Kubernetes에서 애플리케이션을 실행하려면 먼저 각 서비스를 Docker 이미지로 만들어야 합니다. Minikube 내부의 Docker 데몬을 사용하여 이미지를 빌드하면, 별도의 이미지 레지스트리 없이 Minikube 클러스터에서 바로 이미지를 사용할 수 있습니다.

1.  **Minikube Docker 환경 설정:**

    다음 명령어를 실행하여 현재 터미널 세션이 Minikube의 Docker 데몬을 사용하도록 설정합니다.

    ```bash
    eval $(minikube -p minikube docker-env)
    ```

2.  **Docker 이미지 빌드:**

    각 서비스 디렉토리에서 `docker build` 명령을 실행하여 이미지를 빌드합니다.

    ```bash
    # Frontend
    docker build -t simple-rag-frontend:latest ./frontend

    # Backend
    docker build -t simple-rag-backend:latest ./backend

    # Backend UI
    docker build -t simple-rag-backend-ui:latest ./backend-ui
    ```

## 5. Kubernetes Manifest 작성

ArgoCD가 애플리케이션을 배포하려면 각 서비스의 `Deployment`와 `Service`를 정의하는 Kubernetes Manifest 파일이 필요합니다. 이 파일들은 Git 저장소에서 관리됩니다.

프로젝트 루트에 `k8s` 디렉토리를 생성하고, 각 서비스에 대한 YAML 파일을 작성합니다.

*   `k8s/frontend-deployment.yaml`: Frontend 배포 설정
*   `k8s/frontend-service.yaml`: Frontend 서비스 노출 설정
*   `k8s/backend-deployment.yaml`: Backend 배포 설정
*   `k8s/backend-service.yaml`: Backend 서비스 노출 설정
*   `k8s/backend-ui-deployment.yaml`: Backend UI 배포 설정
*   `k8s/backend-ui-service.yaml`: Backend UI 서비스 노출 설정

**참고:** `imagePullPolicy: IfNotPresent` 설정은 Minikube가 로컬에 빌드된 이미지를 사용하도록 강제하는 역할을 합니다.

## 6. ArgoCD를 통한 배포

(진행 예정)
