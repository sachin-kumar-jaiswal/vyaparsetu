import Address from './Address.js';

export const getMyAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (req, res, next) => {
  try {
    const { recipientName, phone, houseNo, street, landmark, city, state, pincode, addressType, isDefault } = req.body;

    if (!recipientName || !phone || !houseNo || !street || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required address fields: recipientName, phone, houseNo, street, city, state, and 6-digit pincode.',
      });
    }

    // Check if this is user's first address, make it default if so
    const count = await Address.countDocuments({ userId: req.user._id });
    const shouldBeDefault = count === 0 ? true : Boolean(isDefault);

    const address = await Address.create({
      userId: req.user._id,
      recipientName,
      phone,
      houseNo,
      street,
      landmark: landmark || '',
      city,
      state,
      pincode,
      addressType: addressType || 'HOME',
      isDefault: shouldBeDefault,
    });

    res.status(201).json({
      success: true,
      message: 'Address saved successfully.',
      address,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }

    const { recipientName, phone, houseNo, street, landmark, city, state, pincode, addressType, isDefault } = req.body;

    if (recipientName) address.recipientName = recipientName;
    if (phone) address.phone = phone;
    if (houseNo) address.houseNo = houseNo;
    if (street) address.street = street;
    if (landmark !== undefined) address.landmark = landmark;
    if (city) address.city = city;
    if (state) address.state = state;
    if (pincode) address.pincode = pincode;
    if (addressType) address.addressType = addressType;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await address.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully.',
      address,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const setDefaultAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }

    address.isDefault = true;
    await address.save();

    res.status(200).json({
      success: true,
      message: 'Default address updated.',
      address,
    });
  } catch (error) {
    next(error);
  }
};
