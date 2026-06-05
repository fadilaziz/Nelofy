import service from './reset_password_service';

//Kirim request change password ke email user
export const request_change_password = async (req, res) => {
  console.log(req.body);
  try {
    const data = await service.request_change_password(req.body);
    return res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Password Reset URL Sent',
      data: data,
    });
  } catch (error) {
    return res.status(401).json({
      code: 401,
      status: 'error',
      message: error.message,
    });
  }
};

//Kirim request reset password ke email user
export const request_reset_password = async (req, res) => {
  try {
    const data = await service.request_reset_password(req.body);
    return res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Password Reset URL Sent',
      data: data,
    });
  } catch (error) {
    return res.status(401).json({
      code: 401,
      status: 'error',
      message: error.message,
    });
  }
};

//Update password user
export const update_password = async (req, res) => {
  try {
    const data = await service.update_password(req.body);
    return res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Password Berhasil Di Update',
    });
  } catch (error) {
    return res.status(401).json({
      code: 401,
      status: 'error',
      message: error.message,
    });
  }
};

//Reset password user
export const reset_password = async (req, res) => {
  try {
    const data = await service.update_password(req.body);
    return res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Password Berhasil Di Reset',
    });
  } catch (error) {
    return res.status(401).json({
      code: 401,
      status: 'error',
      message: error.message,
    });
  }
};
