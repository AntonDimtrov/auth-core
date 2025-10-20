let captchaCode = "";

function generateCaptcha() {
  captchaCode = Math.random().toString(36).substring(2, 7);
  document.getElementById("captcha").innerText = captchaCode;
}

function validateCaptcha() {
  const input = document.getElementById("captchaInput").value.trim();
  return input === captchaCode;
}

window.onload = generateCaptcha;
