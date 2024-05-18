let knowledgeBase;

function uploadPdf() {
    const form = document.getElementById('upload-form');
    const formData = new FormData(form);
    const uploadButton = document.getElementById('upload-button');
    const uploadSpinner = document.getElementById('upload-spinner');
    const uploadButtonText = document.getElementById('upload-button-text');

    uploadButton.disabled = true;
    uploadSpinner.classList.remove('hidden');
    uploadButtonText.textContent = 'Uploading...';

    console.log('Uploading PDF...'); // Debugging line

    fetch('/', {
        method: 'POST',
        body: formData
    }).then(response => {
        console.log('PDF uploaded'); // Debugging line
        return response.json();
    })
    .then(data => {
        console.log('Response received:', data); // Debugging line

        uploadButton.disabled = false;

        uploadSpinner.classList.add('hidden');
        uploadButtonText.textContent = 'Upload PDF';

        if (data.error) {
            alert(data.error);
        } else {
            document.getElementById('summary').textContent = data.summary;
            document.getElementById('evaluation').textContent = data.evaluation;
            knowledgeBase = data.knowledge_base;
        }
    }).catch(error => {
        console.error('Error:', error); // Debugging line

        uploadButton.disabled = false;
        uploadSpinner.classList.add('hidden');
        uploadButtonText.textContent = 'Upload PDF';
    });
}

function askQuestion() {
    const question = document.getElementById('question').value;
    const askButton = document.getElementById('ask-button');
    const askSpinner = document.getElementById('ask-spinner');
    const askButtonText = document.getElementById('ask-button-text');

    askButton.disabled = true;
    askSpinner.classList.remove('hidden');
    askButtonText.classList.add('hidden');

    console.log('Asking question...'); // Debugging line

    fetch('/ask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            question: question,
            knowledge_base: knowledgeBase
        })
    }).then(response => {
        console.log('Question asked'); // Debugging line
        return response.json();
    })
    .then(data => {
        console.log('Response received:', data); // Debugging line

        askButton.disabled = false;
        askSpinner.classList.add('hidden');
        askButtonText.classList.remove('hidden');

        if (data.error) {
            alert(data.error);
        } else {
            document.getElementById('answer').textContent = data.answer;
        }
    }).catch(error => {
        console.error('Error:', error); // Debugging line

        askButton.disabled = false;
        askSpinner.classList.add('hidden');
        askButtonText.classList.remove('hidden');
    });
}

function toggleStar(starNumber) {
    const starRating = document.querySelectorAll('#star-rating i');

    // Reset all stars to gray
    starRating.forEach((star, index) => {
        if (index < starNumber) {
            star.classList.remove('text-gray-400');
            star.classList.add('text-yellow-500');
        } else {
            star.classList.remove('text-yellow-500');
            star.classList.add('text-gray-400');
        }
    });

    // Update selectedStars
    selectedStars = starNumber;
}

function submitFeedback() {
    const commentTextarea = document.getElementById('feedback-comment');
    const submitButton = document.getElementById('submit-feedback');

    // Disable comment textarea and submit button
    commentTextarea.disabled = true;
    submitButton.disabled = true;

    // Change button text to "Submitted"
    submitButton.textContent = "Submitted";

    // Remove black border
    const feedbackSection = document.getElementById('feedback-section');
    feedbackSection.classList.remove('border', 'border-black');

    // Alert the user
    alert('Thank you for the feedback! Rating: ' + selectedStars);
}
