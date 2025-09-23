import { InlineStack, Text, Box } from "@shopify/polaris";

export default function IconHeader({ iconSrc, title, size = 20 }) {
  return (
    <InlineStack gap="200" blockAlign="center">
      <Box style={{ lineHeight: 0 }}>
        <img
          src={iconSrc}
          alt=""
          width={size}
          height={size}
          style={{ display: "block", objectFit: "contain" }}
        />
      </Box>
      <Text as="h2" variant="headingLg">{title}</Text>
    </InlineStack>
  );
}

