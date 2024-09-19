import { useEffect, useRef } from 'react';

const Chatbot: React.FC = () => {
  const botRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (botRef.current) {
      // Tạo thẻ <script> để tải SDK của Coze
      const script = document.createElement('script');
      script.src = 'https://sf-cdn.coze.com/obj/unpkg-va/flow-platform/chat-app-sdk/0.1.0-beta.5/libs/oversea/index.js';
      script.async = true;
      
      // Khởi tạo chatbot sau khi script đã được tải
      script.onload = () => {
        new (window as any).CozeWebSDK.WebChatClient({
          config: {
            bot_id: '7412570070637002769',
          },
          componentProps: {
            title: 'Coze',
          },
        });
      };

      botRef.current.appendChild(script);
    }
  }, []);

  return <div ref={botRef} />;
};

export default Chatbot;
