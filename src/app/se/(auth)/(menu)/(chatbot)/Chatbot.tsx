"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Send,
  CheckCircle2,
  Home,
  MessageSquare,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { deleteCookie, getCookie } from "cookies-next";
import { fetchWithToken } from "@/lib/fetch_data";
import { SE } from "@/lib/api";
import { ProfileData, ProfileRawData } from "../../profile/profile_data";
import { Gender } from "@/enum/gender";
import { toast } from "react-toastify";
import Link from "next/link";
import { Nav } from "@/lib/nav";

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("");
  const [data, setData] = useState<ProfileData | null>();
  const [menuItems, setMenuItems] = useState<Array<string>>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setUsername(getCookie("name") || "");
    setAvatar(getCookie("avatar") || "");
    setMenuItems(getCookie("menu")?.split(",") || []);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function fetchData() {
    fetchWithToken(SE.API_PROFILE)
      .then((response) => response as ProfileRawData)
      .then((data) => {
        if (!data.data) return;

        setData({
          id: data.data.user.id,
          username: data.data.user.username,
          displayName: data.data.user.name,
          phone: data.data.user.phone,
          email: data.data.user.email,
          gender: {
            1: Gender.Male,
            2: Gender.Female,
          }[data.data.user.gender],
          role: data.data.user.role.name,
          activity: data.data.user.activity,
          department: data.data.user.department,
          position: data.data.user.position,
          workLevel: data.data.user.lvWork,
          safeLevel: data.data.user.lvSafe,
          avatar: data.data.user.avatar,
          signature: data.data.user.signature,
        });
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message);
      });
  }

  useEffect(fetchData, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setMessages([...messages, { sender: "user", text: input }]);
    setInput("");

    try {
      const response = await fetch("http://127.0.0.1:8000/ask_question/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      // Sử dụng .text() nếu backend trả về HTML
      const htmlResponse = await response.text();
      setMessages((prev) => [...prev, { sender: "bot", text: htmlResponse }]);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching response from API:", error.message);
      } else {
        console.error("An unexpected error occurred:", error);
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.",
        },
      ]);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="rounded-full w-14 h-14 bg-black hover:bg-gray-800 text-white"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-[400px] shadow-lg overflow-hidden bg-white rounded-2xl border border-gray-200">
          <div className="p-4 flex items-center justify-between bg-black text-white">
            <div className="flex items-center space-x-2">
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 9L12 15L21 9L12 3L3 9Z"
                  fill="white"
                  stroke="white"
                  strokeWidth="2"
                />
                <path
                  d="M3 15L12 21L21 15"
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
              <span className="font-bold text-xl">Sepu</span>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={`${process.env.NEXT_PUBLIC_API_URL}/${avatar}`}
                alt="User avatar"
              />
              <AvatarFallback>AVT</AvatarFallback>
            </Avatar>
          </div>

          <CardContent className="p-0 bg-white">
            <ScrollArea className="h-[450px] px-4 py-2">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-600">
                  Chào {username} 👋
                </h2>
                <h1 className="text-3xl font-bold text-black">
                  Chúng tôi có thể giúp gì cho bạn?
                </h1>

                <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium text-sm">
                      Tình trạng: Tất cả các hệ thống đều hoạt động
                    </span>
                  </div>
                </div>

                <div className="bg-gray-100 rounded-lg border border-gray-200">
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">
                      Bạn cần quản lý phiếu kiểm tra?
                    </h3>
                  </div>
                  <div className="border-t border-b border-gray-200">
                    <Button
                      variant="ghost"
                      className="w-full p-4 h-auto bg-gray-100 hover:bg-gray-200 space-y-2 text-left flex flex-col items-start"
                      onClick={() => {
                        console.log("Pricing clicked");
                      }}
                    >
                      <Link href={`${Nav.INSPECTDOC_PAGE}`} target="_blank">
                        <h3 className="font-medium">Quản lý phiếu kiểm tra</h3>
                        <p className="text-sm text-gray-600 font-normal mt-2">
                          Chuyển đến trang quản lý phiếu kiểm tra
                        </p>
                      </Link>
                    </Button>
                  </div>
                  <div className="p-4">
                    <Button
                      variant="outline"
                      className="w-full hover:bg-stone-100"
                    >
                      <Link href={Nav.INSPECTDOC_DAY_PAGE} target="_blank">
                        Tạo phiếu kiểm tra ngày
                      </Link>
                    </Button>
                    <Button className="w-full text-white hover:bg-stone-500 mt-2">
                      <Link href={Nav.INSPECTDOC_NIGHT_PAGE} target="_blank">
                        Tạo phiếu kiểm tra đêm
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-100 rounded-lg border border-gray-200">
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">
                      Bạn cần quản lý phiếu sửa chữa?
                    </h3>
                  </div>
                  <div className="border-t border-b border-gray-200">
                    <Button
                      variant="ghost"
                      className="w-full p-4 h-auto bg-gray-100 hover:bg-gray-200 space-y-2 text-left flex flex-col items-start"
                      onClick={() => {
                        console.log("Pricing clicked");
                      }}
                    >
                      <Link href={`${Nav.REPAIRDOC_PAGE}`} target="_blank">
                        <h3 className="font-medium">Quản lý phiếu sửa chữa</h3>
                        <p className="text-sm text-gray-600 font-normal mt-2">
                          Chuyển đến trang quản lý phiếu sửa chữa
                        </p>
                      </Link>
                    </Button>
                  </div>
                  <div className="p-4">
                    <Button
                      className="w-full text-white hover:bg-stone-500"
                    >
                      <Link href={Nav.REPAIRDOC_NEW_PAGE} target="_blank">
                        Tạo phiếu sửa chữa
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-100 rounded-lg border border-gray-200">
                  <div className="border-t border-b border-gray-200">
                    <Button
                      variant="ghost"
                      className="w-full p-4 h-auto bg-gray-100 hover:bg-gray-200 space-y-2 text-left flex flex-col items-start"
                      onClick={() => {
                        console.log("Pricing clicked");
                      }}
                    >
                      <Link href={`${Nav.STATISTIC_PAGE}`} target="_blank">
                        <p className="font-normal">
                          Bạn muốn xem thống kê công việc?
                        </p>
                      </Link>
                    </Button>
                  </div>
                </div>

                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.sender === "bot" ? (
                      // Dành cho bot: render nội dung HTML
                      <div
                        className="inline-block p-3 rounded-lg max-w-[80%] bg-gray-200 text-black"
                        dangerouslySetInnerHTML={{ __html: msg.text }}
                        style={{ lineHeight: "1.6", whiteSpace: "pre-wrap" }} // Tăng khoảng cách dòng và giữ định dạng
                      />
                    ) : (
                      // Dành cho user: render nội dung text
                      <div
                        className="inline-block p-3 rounded-lg max-w-[80%] bg-black text-white"
                        style={{ lineHeight: "1.6", whiteSpace: "pre-wrap" }} // Tăng khoảng cách dòng và giữ định dạng
                      >
                        {msg.text}
                      </div>
                    )}
                  </div>
                ))}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="mt-auto">
              <div className="p-4 bg-white border-t border-gray-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    type="text"
                    placeholder="Send a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-black hover:bg-gray-800 text-white"
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </form>
              </div>

              {/* <div className="flex border-t border-gray-200">
                <Button
                  variant="ghost"
                  className="flex-1 rounded-none h-14 hover:bg-gray-100 text-gray-600"
                >
                  <Home className="h-5 w-5" />
                  <span className="ml-2">Home</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1 rounded-none h-14 hover:bg-gray-100 text-gray-600"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="ml-2">Messages</span>
                </Button>
              </div> */}
            </div>
          </CardContent>
        </Card>
      )}

      {isOpen && (
        <Button
          onClick={() => setIsOpen(false)}
          size="icon"
          className="mt-4 rounded-full w-14 h-14 bg-black hover:bg-gray-800 text-white"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </Button>
      )}
    </div>
  );
};

export default ChatBot;
