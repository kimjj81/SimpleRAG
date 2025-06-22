# SimpleRAG

This is a simple RAG (Retrieval-Augmented Generation) application. It uses a Streamlit frontend for user interaction, a Django backend for business logic, a PostgreSQL database for data storage, and OpenSearch for indexing and searching documents.

## Architecture

The application is composed of several services, all managed by Docker Compose:

-   **Frontend (Streamlit):** The user interface for the RAG application.
-   **Backend (Django):** Handles file uploads, processing, and communication with the OpenAI API and OpenSearch.
-   **Backend UI (Next.js):** A simple UI for managing backend data.
-   **Database (PostgreSQL):** Stores metadata about files and chat sessions.
-   **Search (OpenSearch):** Indexes and provides search capabilities for the document content.
-   **Dashboard (OpenSearch Dashboards):** A visualization and management interface for OpenSearch.

## Getting Started

### Prerequisites

*   Docker
*   Docker Compose

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/SimpleRAG.git
    cd SimpleRAG
    ```
2.  Create a `.env` file in the root directory of the project and add your OpenAI API key:
    ```
    OPENAI_API_KEY=your-api-key
    ```
3.  Build and run the services using Docker Compose:
    ```bash
    docker-compose up --build -d
    ```

## Usage

Once the services are running, you can access the different parts of the application through your browser:

*   **Frontend (Streamlit):** [http://localhost:8501](http://localhost:8501)
*   **Backend UI (Next.js):** [http://localhost:3000](http://localhost:3000)
*   **Backend (Django Admin):** [http://localhost:8000/admin](http://localhost:8000/admin)
*   **OpenSearch Dashboards:** [http://localhost:5601](http://localhost:5601)

To stop the services, run:
```bash
docker-compose down
