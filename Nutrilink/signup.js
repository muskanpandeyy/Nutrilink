const signupForm = document.getElementById('signup-form');
const messageDiv = document.getElementById('message');

function showMessage(text, isError = false) {
    messageDiv.textContent = text;
    messageDiv.style.color = isError ? 'red' : 'green';
    messageDiv.style.display = 'block';
}

signupForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(signupForm);
    const signupData = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        const response = await fetch('http://localhost:5000/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signupData)
        });

        const data = await response.json();

        if (data.success) {
            showMessage('Account created successfully! Redirecting to login...', false);
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showMessage(data.message || 'Signup failed. Please try again.', true);
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Something went wrong! Please try again.', true);
    }
}); 