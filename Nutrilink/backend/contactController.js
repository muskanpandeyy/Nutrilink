const Contact = require('../models/Contact');

const submitContactForm = async (req, res) => {
  try {
    const { name, email, topic, message } = req.body;

    // Create new contact submission
    const contact = new Contact({
      name,
      email,
      topic,
      message
    });

    // Save to database
    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Your message has been submitted successfully. We will get back to you soon.'
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit your message. Please try again later.',
      error: error.message
    });
  }
};

module.exports = {
  submitContactForm
}; 