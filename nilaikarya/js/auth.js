function login(role) {
  if (role === "guru") {
    window.location.href = "guru/dashboard.html";
    return;
  }

  if (role === "parent") {
    const nisInput = document.getElementById("nis-input");
    const nis = nisInput ? nisInput.value.trim() : "";
    const params = new URLSearchParams();
    if (nis) params.set("nis", nis);
    window.location.href = `orang-tua/dashboard.html${params.toString() ? "?" + params.toString() : ""}`;
    return;
  }

  console.warn("Unknown login role:", role);
}

function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}
