import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Box, Button, Container, Heading, Image, SimpleGrid, Spinner, Text, VStack, useColorModeValue,
} from "@chakra-ui/react";
import { useProductStore } from "../store/product";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { fetchProductById, fetchSimilar } = useProductStore();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(true);

  const bg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.200");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadingSimilar(true);
    setSimilar([]);
    window.scrollTo(0, 0);

    fetchProductById(id).then(({ success, product, message }) => {
      if (!active) return;
      if (success) {
        setProduct(product);
        setError("");
      } else {
        setProduct(null);
        setError(message);
      }
      setLoading(false);
    });

    fetchSimilar(id).then((items) => {
      if (!active) return;
      setSimilar(items);
      setLoadingSimilar(false);
    });

    return () => {
      active = false;
    };
  }, [id, fetchProductById, fetchSimilar]);

  return (
    <Container maxW="container.md" py={8}>
      <Link to="/">
        <Button variant="ghost" mb={4}>← Back to products</Button>
      </Link>

      {loading && <VStack py={20}><Spinner size="xl" /></VStack>}

      {!loading && error && (
        <Text textAlign="center" fontSize="xl" color="gray.500">{error} 😢</Text>
      )}

      {!loading && product && (
        <>
          <Box bg={bg} rounded="lg" shadow="lg" overflow="hidden">
            <Image src={product.image} alt={product.name} w="full" maxH="420px" objectFit="cover" />
            <Box p={6}>
              <Heading as="h1" size="lg" mb={2}>{product.name}</Heading>
              <Text fontWeight="bold" fontSize="2xl" color={textColor} mb={4}>
                ₹{product.price}
              </Text>
              <Text color={textColor} whiteSpace="pre-wrap">
                {product.description || "No description available."}
              </Text>
            </Box>
          </Box>

          <Heading as="h2" size="md" mt={10} mb={4}>✨ You may also like</Heading>

          {loadingSimilar && <Spinner />}

          {!loadingSimilar && similar.length === 0 && (
            <Text color="gray.500">No similar products yet.</Text>
          )}

          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            {similar.map((p) => (
              <Link key={p._id} to={`/product/${p._id}`}>
                <Box
                  bg={bg} rounded="lg" shadow="md" overflow="hidden"
                  transition="all 0.2s" _hover={{ transform: "translateY(-4px)", shadow: "lg" }}
                >
                  <Image src={p.image} alt={p.name} h="110px" w="full" objectFit="cover" />
                  <Box p={3}>
                    <Text fontWeight="bold" fontSize="sm" noOfLines={1}>{p.name}</Text>
                    <Text fontSize="sm" color={textColor}>₹{p.price}</Text>
                  </Box>
                </Box>
              </Link>
            ))}
          </SimpleGrid>
        </>
      )}
    </Container>
  );
};

export default ProductDetailPage;