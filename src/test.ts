const MESSAGES = [
  "Hola",
  "Quien eres?",
  "Quiero genera la paleta de colores",
  "Mi empresa es una empresa de moda para toda la familia que vende ropa de todos los tamaños",
  "Quiero generar los tipos de fuente",
  "Genera la paleta de colores",
];
const sendMessage = async () => {
  let chatId = "";
  for (const message of MESSAGES) {
    const res = await fetch("http://localhost:3001/chatbot/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: message, ...(chatId ? { chatId } : {}) }),
    });
    const data = await res.json();
    if (!chatId && data.chatId) {
      chatId = data.chatId;
    }
    console.log({ data, chatId });
  }
};

sendMessage();
