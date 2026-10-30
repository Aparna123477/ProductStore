import {
  Button, Container, Flex, HStack, Text, useColorMode,
  Menu, MenuButton, MenuList, MenuItem,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { PlusSquareIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { IoMoon } from "react-icons/io5";
import { LuSun, LuLogOut } from "react-icons/lu";
import { handleSuccess } from "../utils";
import { useAuthStore } from "../store/auth";

const Navbar = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    const navigate = useNavigate();
    const { isAuthenticated, userName, logout } = useAuthStore();

    const handleLogout = async() => {
        await logout();
        handleSuccess("Logged out successfully");
        navigate("/login");
    };

    const authBtnProps = {
        variant: "ghost",
        size: "sm",
        _hover: { bg: "#38bdf8", color: "white" },
        _active: { bg: "#0ea5e9", color: "white" },
    };

    return (
        <Container maxW={"1140px"} px={4}>
            <Flex
                h={16}
                alignItems={"center"}
                justifyContent={"space-between"}
                flexDir={{ base: "column", sm: "row" }}
            >
                <Text
                    fontSize={{ base: "22", sm: "28" }}
                    fontWeight={"bold"}
                    textTransform={"uppercase"}
                    textAlign={"center"}
                    bgGradient={"linear(to-r, cyan.400, blue.500)"}
                    bgClip={"text"}
                >
                    <Link to={"/"}>Product Store 🛒</Link>
                </Text>

                <HStack spacing={3} alignItems={"center"}>
                    {isAuthenticated ? (
                        <>
                            <Link to="/create">
                                <Button><PlusSquareIcon fontSize={20} /></Button>
                            </Link>

                            <Menu>
                                <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="ghost">
                                    {userName}
                                </MenuButton>
                                <MenuList>
                                    <MenuItem icon={<LuLogOut />} onClick={handleLogout}>
                                        Logout
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        </>
                    ) : (
                        <>
                            <Link to="/login"><Button {...authBtnProps}>Login</Button></Link>
                            <Link to="/signup"><Button {...authBtnProps}>Signup</Button></Link>
                        </>
                    )}

                    <Button onClick={toggleColorMode}>
                        {colorMode === "light" ? <IoMoon /> : <LuSun size="20" />}
                    </Button>
                </HStack>
            </Flex>
        </Container>
    );
};

export default Navbar;