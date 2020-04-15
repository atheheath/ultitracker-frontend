require('process')
// These IPs come from `docker-compose.yml`
export const SERVER_API_HOST = process.env.REACT_APP_SERVER_API_HOST;
export const SERVER_IMAGE_HOST = process.env.REACT_APP_SERVER_IMAGE_HOST;
console.log("SERVER_API_HOST: " + SERVER_API_HOST);
console.log("SERVER_IMAGE_HOST: " + SERVER_IMAGE_HOST);
export const apiURI = SERVER_API_HOST;
export const imgRootPath = SERVER_IMAGE_HOST;
export const vizserverURI = SERVER_API_HOST;
export const annotatorExtension = "annotator";
export const fieldLinesNames = ["top_sideline", "left_back_endzone", "left_front_endzone", "right_front_endzone", "right_back_endzone", "bottom_sideline", "fifty_yardline", "top_hash", "bottom_hash"];