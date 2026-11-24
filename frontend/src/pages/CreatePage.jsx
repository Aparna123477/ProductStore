import { useState } from "react";
import { useProductStore } from "../store/product";

import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Textarea,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";

const emptyProduct = { name: "", price: "", image: "", description: "" };

const CreatePage = () => {
  const [newProduct, setNewProduct] = useState(emptyProduct);
  const [generating, setGenerating] = useState(false);
  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.800");
  const { createProduct, generateDescription } = useProductStore();

  const showToast = (title, description, status) =>
    toast({ title, description, status, duration: 5000, isClosable: true });

  const handleAddProduct = async () => {
    const { success, message } = await createProduct(newProduct);
    if (!success) {
      showToast("Error", message, "error");
    } else {
      showToast("Success", message, "success");
      setNewProduct(emptyProduct);
    }
  };

  const handleGenerate = async () => {
    if (!newProduct.name.trim()) {
      showToast("Enter product name first", "", "warning");
      return;
    }
    setGenerating(true);
    const { success, message, description } = await generateDescription({
      name: newProduct.name,
      notes: newProduct.description, // kuch likha ho to AI usse improve karega
    });
    setGenerating(false);

    if (!success) {
      showToast("Error", message, "error");
      return;
    }
    setNewProduct((p) => ({ ...p, description }));
  };

  return (
    <Container maxW="container.sm">
      <VStack spacing={8}>
        <Heading
          as="h1"
          size="2xl"
          textAlign="center"
          mb={8}
          bgGradient="linear(to-r, cyan.400, blue.500)"
          bgClip="text"
        >
          Create New Product
        </Heading>

        <Box w="full" bg={cardBg} p={6} rounded="lg" shadow="md">
          <VStack spacing={4}>
            <Input
              placeholder="Product Name"
              name="name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />

            <Input
              placeholder="Product Price (₹)"
              name="price"
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            />

            <Input
              placeholder="Product Image URL"
              name="image"
              value={newProduct.image}
              onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
            />

            <Textarea
              placeholder="Product description (or generate with AI)"
              rows={4}
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            />

            <Button
              variant="outline"
              w="full"
              onClick={handleGenerate}
              isLoading={generating}
              loadingText="Generating..."
            >
              ✨ Generate with AI
            </Button>

            <Button colorScheme="blue" w="full" onClick={handleAddProduct}>
              Add Product
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default CreatePage;