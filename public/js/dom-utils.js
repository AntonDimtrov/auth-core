export function show(id) {
  document.getElementById(id).style.display = "block";
}

export function hide(id) {
  document.getElementById(id).style.display = "none";
}

export function val(id) {
  return document.getElementById(id).value.trim();
}

export function markInvalid(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("invalid");
}

export function resetValidation(ids) {
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("invalid", "valid");
  });
}

export function clearForm(ids) {
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}
