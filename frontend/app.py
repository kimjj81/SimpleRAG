import streamlit as st
import requests

st.title("SimpleRAG Chat")

def get_sessions():
    response = requests.get("http://backend:8000/api/sessions/")
    return response.json()

def create_session():
    response = requests.post("http://backend:8000/api/sessions/", data={"user": 1})
    return response.json()

def get_messages(session_id):
    response = requests.get(f"http://backend:8000/api/sessions/{session_id}/")
    return response.json()["messages"]

def post_message(session_id, role, content):
    data = {"session": session_id, "role": role, "content": content}
    response = requests.post("http://backend:8000/api/messages/", data=data)
    return response.json()

with st.sidebar:
    st.subheader("Sessions")
    sessions = get_sessions()
    session_ids = [session["id"] for session in sessions]
    selected_session = st.selectbox("Select a session", session_ids)

    if st.button("New Session"):
        new_session = create_session()
        st.session_state.session_id = new_session["id"]
        st.rerun()

    st.subheader("Upload a file")
    uploaded_file = st.file_uploader("Choose a file", type=["docx", "txt", "md", "xlsx"])
    if uploaded_file is not None:
        files = {"file": (uploaded_file.name, uploaded_file.getvalue())}
        response = requests.post("http://backend:8000/api/upload/", files=files)
        if response.status_code == 201:
            st.success("File uploaded successfully!")
        else:
            st.error("Error uploading file")

if "session_id" not in st.session_state:
    if sessions:
        st.session_state.session_id = sessions[0]["id"]
    else:
        new_session = create_session()
        st.session_state.session_id = new_session["id"]

if st.session_state.session_id:
    if "messages" not in st.session_state or st.session_state.get("session_id") != selected_session:
        st.session_state.session_id = selected_session
        st.session_state.messages = get_messages(st.session_state.session_id)

    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
            if message.get("input_tokens", 0) > 0:
                st.markdown(f"**Input Tokens:** {message['input_tokens']}")
            if message.get("output_tokens", 0) > 0:
                st.markdown(f"**Output Tokens:** {message['output_tokens']}")

if prompt := st.chat_input("What is up?"):
    post_message(st.session_state.session_id, "user", prompt)
    st.session_state.messages = get_messages(st.session_state.session_id)
    st.rerun()
    
    # The assistant's response will be added by the backend,
    # so we just need to refresh the messages.
    st.session_state.messages = get_messages(st.session_state.session_id)
    st.rerun()
