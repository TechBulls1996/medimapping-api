const { generateToken } = require("../helper/global");
const User = require("../db/models/User");
const bcrypt = require("bcrypt");

export const registerUser = async (data: any) => {
  const {
    fullName,
    email,
    password,
    phone,
    dob,
    gender,
    bloodGroup,
    country,
    state,
    city,
    address,
    pinCode,
  } = data;
  try {
    const passwordHash = await generatePassword(password);
    const user = await User.create({
      name: fullName,
      email,
      password: passwordHash,
      mobile: phone,
      dob,
      gender,
      bloodGroup,
      country,
      state,
      city,
      address,
      pinCode,
    });

    if (user) {
      const jwtToken = await generateToken(user.id, user?.name, user?.email);
      if (!jwtToken) return false;

      return {
        status: true,
        authToken: jwtToken,
        user: {
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          country: user.country,
          state: user.state,
          city: user.city,
          pinCode: user.pinCode,
          roles: user.roles,
        },
      };
    }
  } catch (err) {
    console.log("Register Error:", err);
    return { status: false, error: err };
  }
  return false;
};

export const loginUser = async (email: string, password: string) => {
  try {
    //find user and compare password
    const user = await User.findOne({ email: email }).exec();
    const comparePass = await comparePassword(password, user?.password);

    if (user && comparePass) {
      //gereate Token
      const jwtToken = await generateToken(user.id, user?.name, user?.email);
      if (!jwtToken) return false;

      return {
        status: true,
        authToken: jwtToken,
        user: {
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          country: user.country,
          state: user.state,
          city: user.city,
          pinCode: user.pinCode,
          roles: user.roles,
        },
      };
    }
    return false;
  } catch (error) {
    console.log("Login Error::::::", error);
    return false;
  }
};

export const generatePassword = async (password: any) => {
  const saltRounds = 10;

  const hash = await bcrypt.hash(password, saltRounds).catch((err: any) => {
    console.log("Hash Generation Error: ", err);
    return false;
  });
  return hash;
};

export const comparePassword = async (password: any, passwordHash: any) => {
  const hash = await bcrypt
    .compare(password, passwordHash)
    .catch((err: any) => {
      console.log("Hash Compare::::: ", err);
      return false;
    });

  return hash;
};

export const UpdatePassword = async (email: string, password: string) => {
  try {
    const passHash = await generatePassword(password);
    const user = await User.findOneAndUpdate(
      { email: email },
      { password: passHash }
    );
    if (user) {
      return true;
    }
  } catch (error) {
    console.log("Password Error:", error);
  }

  return false;
};

export const findUserByEmail = async (email: any) => {
  try {
    const user = await User.findOne({ email: email }).exec();
    if (user) {
      return user;
    }
  } catch (err) {
    console.log("Error: ", err);
  }
  return false;
};
