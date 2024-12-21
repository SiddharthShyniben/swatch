import Conf from 'conf';

const config = new Conf({
  projectName: "swatch",
})

export const getLibrary = () => config.get("colors", []);
export const setLibrary = (library) => config.set("colors", library);
