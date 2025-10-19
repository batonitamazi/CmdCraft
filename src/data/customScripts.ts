export interface CustomScript {
  name: string;
  content: string;
}

const customScripts: CustomScript[] = [];

export const saveCustomScript = (script: CustomScript) => {
  customScripts.push(script);
};

export const getCustomScripts = () => {
  return customScripts;
};