document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // You can add validation checks here if needed

    // After form is submitted, display a success message
    if(name && email && message) {
        document.getElementById('contact-form').reset();
        document.getElementById('success-message').style.display = 'block';
    }
});