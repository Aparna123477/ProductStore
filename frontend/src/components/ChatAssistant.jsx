import { useState, useRef, useEffect } from "react";
import {
  Box, Button, HStack, IconButton, Image, Input, Text, VStack, useColorModeValue,
} from "@chakra-ui/react";
import { useProductStore } from "../store/product";
import { Link } from "react-router-dom";

const ChatAssistant = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! Tell me what you're looking for 🛍️", products: [] },
  ]);
  const { assistantChat } = useProductStore();
  const bottomRef = useRef(null);

  const bg = useColorModeValue("white", "gray.800");
  const userBg = useColorModeValue("blue.500", "blue.400");
  const botBg = useColorModeValue("gray.100", "gray.700");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const history = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((m) => [...m, { role: "user", text, products: [] }]);
    setInput("");
    setLoading(true);

    const { success, reply, products, message } = await assistantChat(text, history);
    setLoading(false);

    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        text: success ? reply : message || "Something went wrong",
        products: success ? products : [],
      },
    ]);
  };

  if (!open) {
    return (
      <Button
        position="fixed" bottom={6} right={6} zIndex={20}
        colorScheme="blue" rounded="full" size="lg" shadow="lg"
        onClick={() => setOpen(true)}
      >
        💬 Ask AI
      </Button>
    );
  }

  return (
    <Box
      position="fixed" bottom={6} right={6} zIndex={20}
      w={{ base: "calc(100vw - 32px)", sm: "360px" }} h="480px"
      bg={bg} rounded="xl" shadow="2xl" display="flex" flexDir="column" overflow="hidden"
    >
      <HStack justify="space-between" px={4} py={3} bg="blue.500" color="white">
        <Text fontWeight="bold">Shopping Assistant</Text>
        <IconButton aria-label="Close" size="sm" variant="ghost" _hover={{ bg: "blue.600" }}
          icon={<Text>✕</Text>} onClick={() => setOpen(false)} />
      </HStack>

      <VStack flex="1" overflowY="auto" p={3} spacing={3} align="stretch">
        {messages.map((m, i) => (
          <Box key={i} alignSelf={m.role === "user" ? "flex-end" : "flex-start"} maxW="85%">
            <Box
              px={3} py={2} rounded="lg" fontSize="sm"
              bg={m.role === "user" ? userBg : botBg}
              color={m.role === "user" ? "white" : undefined}
            >
              {m.text}
            </Box>
            {m.products?.map((p) => (
  <HStack
    key={p._id}
    as={Link}
    to={`/product/${p._id}`}
    mt={2} p={2} rounded="md" borderWidth="1px" spacing={3}
    _hover={{ borderColor: "blue.400", bg: "blackAlpha.100" }}
  >
<Image
  src={p.image}
  alt={p.name}
  boxSize="48px"
  objectFit="cover"
  rounded="md"
  referrerPolicy="no-referrer"
  
/>    <Box>
      <Text fontSize="sm" fontWeight="bold" noOfLines={1}>{p.name}</Text>
      <Text fontSize="sm">₹{p.price}</Text>
      <Text fontSize="xs" color="blue.400">View details →</Text>
    </Box>
  </HStack>
))}
          </Box>
        ))}
        {loading && <Text fontSize="sm" color="gray.500">Thinking...</Text>}
        <div ref={bottomRef} />
      </VStack>

      <HStack p={3} borderTopWidth="1px">
        <Input
          size="sm" placeholder="e.g. gift under 3000"
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <Button size="sm" colorScheme="blue" onClick={send} isLoading={loading}>Send</Button>
      </HStack>
    </Box>
  );
};

export default ChatAssistant;