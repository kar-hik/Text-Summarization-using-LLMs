from flask import Flask, render_template, request, jsonify
from PyPDF2 import PdfReader
from langchain.chains.question_answering import load_qa_chain
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.llms import Cohere
from langchain.embeddings import CohereEmbeddings
from langchain.vectorstores import FAISS
import cohere

app = Flask(__name__)

# Global variables to store the knowledge base and API key
knowledge_base = None
api_key = "otknHihD8DeVE0xx1y9kecxTOk6MBF77OPCf12cb"

# Function to generate summary
def generate_summary(full_text, api_key):
    co = cohere.Client(api_key)
    response = co.summarize(
        text=full_text,
        length='medium',
        format='paragraph',
        model='summarize-xlarge',
        temperature=0.3,
    )
    return response.summary

@app.route('/', methods=['GET', 'POST'])
def index():
    global knowledge_base

    if request.method == 'POST':
        if 'pdf' not in request.files:
            return jsonify({'error': 'No file part'})

        pdf_file = request.files['pdf']
        if pdf_file.filename == '':
            return jsonify({'error': 'No selected file'})

        text = ""
        pdf_reader = PdfReader(pdf_file)
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            text += page_text.encode('utf-8', 'ignore').decode('utf-8')

        text_splitter = CharacterTextSplitter(
            separator="\n",
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
        )
        chunks = text_splitter.split_text(text)

        # Generate summary (optional)
        full_text = " ".join(chunks)
        try:
            summary = generate_summary(full_text, api_key)
        except Exception as e:
            print(f"Error generating summary: {str(e)}")
            return jsonify({'error': 'Error generating summary'})

        # Simple evaluation heuristic (optional)
        if len(summary.split()) < 50 or len(summary.split()) > 300:
            evaluation_result = "Summary length is not optimal."
        else:
            evaluation_result = "Summary length is appropriate."

        # Create the knowledge base
        embeddings = CohereEmbeddings(cohere_api_key=api_key)
        knowledge_base = FAISS.from_texts(chunks, embeddings)

        return jsonify({'summary': summary, 'evaluation': evaluation_result})

    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask():
    global knowledge_base

    if knowledge_base is None:
        return jsonify({'error': 'Knowledge base is not created. Please upload a PDF first.'})

    data = request.json
    question = data.get('question')

    if not question:
        return jsonify({'error': 'No question provided'})

    try:
        # Perform similarity search
        docs = knowledge_base.similarity_search(question)

        # Initialize LLM and QA chain
        llm = Cohere(cohere_api_key=api_key, temperature=0.5)
        chain = load_qa_chain(llm, chain_type="stuff")

        # Get response from QA chain
        response = chain.run(input_documents=docs, question=question)
    except Exception as e:
        print(f"Error answering question: {str(e)}")
        return jsonify({'error': 'Error answering question'})

    return jsonify({'answer': response})

if __name__ == '__main__':
    app.run(debug=True)
