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

    > **참고:** 위 명령어는 Kubernetes 클러스터 내에 `Secret`으로 저장된 초기 비밀번호를 조회하여 터미널에 출력하는 명령어입니다. 별도의 `.data` 파일을 생성할 필요 없이, 터미널에 출력된 비밀번호를 복사하여 사용하면 됩니다.

    ---
    
    #### **로그인이 계속 실패할 경우 (비밀번호 재설정)**
    
    만약 위 명령어로 얻은 비밀번호로 로그인이 계속 실패한다면, 로그인 시도 횟수 초과로 계정이 잠겼거나 다른 문제가 발생했을 수 있습니다. 다음 절차에 따라 비밀번호를 완전히 재설정할 수 있습니다.
    
    1.  **기존 비밀번호 정보 삭제:**
        ArgoCD의 `admin` 계정 비밀번호가 저장된 `Secret`을 초기화합니다.
        ```bash
        kubectl -n argocd patch secret argocd-secret --type=json -p='[{"op": "remove", "path": "/data/admin.password"}, {"op": "remove", "path": "/data/admin.passwordMtime"}]'
        ```
    
    2.  **ArgoCD 서버 재시작:**
        ArgoCD 서버 파드를 삭제하여 Kubernetes가 자동으로 재시작하도록 합니다. 이 과정에서 새로운 비밀번호가 생성됩니다.
        ```bash
        kubectl delete pod -n argocd -l app.kubernetes.io/name=argocd-server
        ```
    
    3.  **새로운 비밀번호 확인:**
        서버가 재시작된 후(약 1분 정도 소요), **아래 명령어를 다시 실행하여 완전히 새롭게 생성된 비밀번호를 확인**하고 로그인합니다.
        ```bash
        kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
        ```
    ---

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
*   `k8s/postgres-secret.yaml`: PostgreSQL 비밀번호 설정
*   `k8s/postgres-statefulset.yaml`: PostgreSQL 배포 설정 (StatefulSet)
*   `k8s/postgres-service.yaml`: PostgreSQL 서비스 노출 설정
*   `k8s/opensearch-deployment.yaml`: OpenSearch 배포 설정
*   `k8s/opensearch-service.yaml`: OpenSearch 서비스 노출 설정

**참고:**
*   `imagePullPolicy: IfNotPresent` 설정은 Minikube가 로컬에 빌드된 이미지를 사용하도록 강제하는 역할을 합니다.
*   `backend-deployment.yaml`에는 `backend`가 `PostgreSQL`과 `OpenSearch`에 연결하는 데 필요한 환경 변수(`DATABASE_URL`, `OPENSEARCH_URL`)가 포함되어야 합니다.
*   `opensearch-deployment.yaml`에는 초기 관리자 비밀번호를 설정하는 `OPENSEARCH_INITIAL_ADMIN_PASSWORD` 환경 변수가 반드시 포함되어야 합니다.

**`.env` 파일과의 관계:**
Kubernetes 배포에서는 `.env` 파일을 사용하지 않습니다. 대신, `Deployment`나 `StatefulSet` YAML 파일 내의 `env` 섹션 또는 `Secret` 파일을 통해 컨테이너에 필요한 환경 변수를 직접 주입합니다. 따라서 Kubernetes 배포를 진행할 때에는 `.env` 파일을 수정하거나 추가할 필요가 없습니다.

## 6. ArgoCD를 통한 배포

실제 운영 환경에서는 Git 저장소의 변경 사항을 감지하여 자동으로 배포하는 GitOps 워크플로우를 구성하지만, 로컬 테스트 환경에서는 `kubectl`을 사용하여 manifest를 직접 클러스터에 적용합니다. ArgoCD UI는 배포된 애플리케이션의 상태를 시각적으로 모니터링하는 용도로 활용할 수 있습니다.

1.  **Manifest 적용:**

    `k8s` 디렉토리에 있는 모든 manifest 파일을 클러스터에 적용합니다.

    ```bash
    kubectl apply -f k8s/
    ```

2.  **배포 상태 확인:**

    다음 명령어를 사용하여 `default` 네임스페이스의 파드, 서비스, 배포 상태를 확인할 수 있습니다.

    ```bash
    # 파드 상태 확인
    kubectl get pods

    # 서비스 상태 및 IP 확인
    kubectl get services
    ```

3.  **애플리케이션 접속:**

    `LoadBalancer` 타입의 서비스는 Minikube 환경에서 `minikube service` 명령어를 통해 외부 IP 주소를 할당받고 브라우저에서 바로 열 수 있습니다.

    ```bash
    minikube service frontend
    minikube service backend-ui
    ```
