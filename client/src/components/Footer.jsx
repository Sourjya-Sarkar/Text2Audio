import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const Footer = () => (
  <MotionBox
    as="footer"
    py={4}
    bg="blackAlpha.800"
    textAlign="center"
    zIndex="1"
    transition={{ delay: 1 }}
  >
    <Text fontSize="sm" color="gray.400">
      © {new Date().getFullYear()} Text2Audio. All rights reserved.
    </Text>
  </MotionBox>
);

export default Footer;