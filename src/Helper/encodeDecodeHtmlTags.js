const decodeHtmlEntity = (str) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
};

const encodeHtmlEntity = (str) => {
    const txt = document.createElement("textarea");
    txt.textContent = str;
    return txt.innerHTML;
};

module.exports = {decodeHtmlEntity, encodeHtmlEntity};