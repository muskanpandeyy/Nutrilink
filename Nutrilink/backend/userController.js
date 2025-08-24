const User = require('../models/User');

// Update user settings
const updateUserSettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      name,
      emailNotifications,
      newDonationsAlerts,
      theme,
      language,
      profile,
      settings
    } = req.body;

    // Find user and update
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic info
    if (name) user.name = name;

    // Update settings
    user.settings = {
      ...user.settings,
      emailNotifications: emailNotifications !== undefined ? emailNotifications : user.settings?.emailNotifications,
      newDonationsAlerts: newDonationsAlerts !== undefined ? newDonationsAlerts : user.settings?.newDonationsAlerts,
      theme: theme || user.settings?.theme,
      language: language || user.settings?.language
    };

    // Update profile if provided
    if (profile) {
      user.profile = {
        ...user.profile,
        ...profile
      };
    }

    // Update stats
    user.stats.lastActive = new Date();

    // Save to database
    await user.save();

    // Send back updated user data
    res.json({
      success: true,
      message: 'Settings updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        settings: user.settings,
        profile: user.profile,
        stats: user.stats
      }
    });

  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update settings',
      error: error.message 
    });
  }
};

module.exports = {
  updateUserSettings
}; 