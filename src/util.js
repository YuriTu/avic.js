export const url2blob = (url) => {
    return fetch(url, {
        responseType:'blob'
    }).then(rs => rs.blob());
};

export const url2buffer = (url) => {
    return fetch(url, {
        responseType:'arrayBuffer'
    }).then(rs => rs.arrayBuffer());
}

export const blob2buffer = (blob) => {
    return blob.arrayBuffer();
}

