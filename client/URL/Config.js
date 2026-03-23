const API = import.meta.env.VITE_API_BASE ?? "";

export const Config = {
  baseUrl: `${API}/api/user`,
  SignUPUrl: `${API}/api/user/signup`,
  LOGINUrl: `${API}/api/user/login`,
  GoogleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "60025884553-nj9828bafm1j5gmosermiu2h2clngui9.apps.googleusercontent.com",
  GoogleSignUpUrl: `${API}/api/user/googleLogin`,
  LogoutUrl: `${API}/api/user/logout`,
  ContactUrl: `${API}/api/contacts/addcontact`,
  GETDATAUrl: `${API}/api/user/get-data`,
  CHECKAuthUrl: `${API}/api/user/auth-check`,
  DELETECONTACTUrl: `${API}/api/contacts/delete-contact`,
  EMERGENCYUrl: `${API}/api/contacts/emergency`,
  ADDREVIEWUrl: `${API}/api/reviews/addreview`,
  GETREVIEWSUrl: `${API}/api/reviews/allreviews`,
  ADDPROFILEPHOTO: `${API}/api/profile/add-photo`,
  UPDATEUSERNAME: `${API}/api/profile/update-name`,
  UPDATEEMAIL: `${API}/api/profile/update-email`,
  UPDATEPASSWORD: `${API}/api/profile/update-password`
};
