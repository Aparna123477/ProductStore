import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useAuthStore } from "../store/auth"; // Adjust import to your auth store

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const toast = useToast();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleLogin = async () => {
    const { success, message } = await login(formData);

    if (!success) {
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Success",
        description: "Logged in successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      navigate("/");
    }
  };

  return (
    <Container maxW="container.sm" py={12}>
      <VStack spacing={8}>
        <Heading
          as="h1"
          size="2xl"
          textAlign="center"
          bgGradient="linear(to-r, cyan.400, blue.500)"
          bgClip="text"
        >
          Welcome Back
        </Heading>

        <Box
          w="full"
          bg={useColorModeValue("white", "gray.800")}
          p={6}
          rounded="lg"
          shadow="md"
        >
          <VStack spacing={4}>
            <Input
              placeholder="Email address"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <Input
              placeholder="Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            <Button colorScheme="blue" w="full" onClick={handleLogin}>
              Log In
            </Button>

            <Text fontSize="sm" color="gray.500">
              Don't have an account?{" "}
              <Link to="/signup">
                <Text
                  as="span"
                  color="blue.500"
                  _hover={{ textDecoration: "underline" }}
                >
                  Sign Up
                </Text>
              </Link>
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default LoginPage;