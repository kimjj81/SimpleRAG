# SimpleRAG

This is a simple RAG application with a Streamlit frontend and a Django backend.

## Getting Started

### Prerequisites

*   Docker
*   Docker Compose

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/SimpleRAG.git
    ```
2.  Create a `.env` file in the root directory of the project and add your OpenAI API key:
    ```
    OPENAI_API_KEY=your-api-key
    ```
3.  Build and run the services using Docker Compose:
    ```bash
    docker-compose up --build
    ```

## Usage

*   **Frontend (Streamlit):** [http://localhost:8501](http://localhost:8501)
*   **Backend UI (Next.js):** [http://localhost:3000](http://localhost:3000)
*   **Backend (Django Admin):** [http://localhost:8000/admin](http://localhost:8000/admin)
