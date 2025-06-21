import streamlit as st

st.title("SimpleRAG Chat")

if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

import requests

with st.sidebar:
    st.subheader("Upload a file")
    uploaded_file = st.file_uploader("Choose a file", type=["docx", "txt", "md", "xlsx"])
    if uploaded_file is not None:
        files = {"file": uploaded_file.getvalue()}
        response = requests.post("http://backend:8000/api/upload/", files=files)
        if response.status_code == 201:
            st.success("File uploaded successfully!")
        else:
            st.error("Error uploading file")

if prompt := st.chat_input("What is up?"):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        st.markdown("Hello! I am a RAG assistant. How can I help you today?")
