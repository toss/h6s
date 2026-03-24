import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import type { DateRange } from "@h6s/calendar";
import { useCalendar, useSelection } from "@h6s/calendar";
import { format } from "date-fns";
import locale from "date-fns/locale/en-US";

import { Container } from "../../components/Container";

// ─── Single Mode ─────────────────────────────────────────

function SingleDemo() {
  const { cursorDate, headers, body, navigation } = useCalendar();
  const selection = useSelection({
    mode: "single",
    body,
    disabled: { dayOfWeek: [0, 6] },
  });

  return (
    <Box>
      <Text fontSize="sm" color="gray.500" mb={4}>
        Click a weekday to select. Weekends (Sat/Sun) are disabled.
      </Text>
      <Flex justify="space-between" align="center" mb={4}>
        <IconButton aria-label="Previous" icon={<ChevronLeftIcon />} onClick={navigation.toPrev} />
        <Text fontSize="2xl">{format(cursorDate, "yyyy. MM")}</Text>
        <IconButton aria-label="Next" icon={<ChevronRightIcon />} onClick={navigation.toNext} />
      </Flex>
      <Table variant="simple" size="lg">
        <Thead>
          <Tr>
            {headers.weekdays.map(({ key, value }) => (
              <Th key={key}>{format(value, "E", { locale })}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {selection.body.value.map((week) => (
            <Tr key={week.key}>
              {week.value.map((day) => (
                <Td
                  key={day.key}
                  opacity={day.isCurrentMonth ? 1 : 0.2}
                  bg={day.isSelected ? "blue.500" : "transparent"}
                  cursor={day.isDisabled ? "not-allowed" : "pointer"}
                  onClick={() => !day.isDisabled && selection.select(day.value)}
                >
                  <Text
                    textAlign="center"
                    color={day.isSelected ? "white" : day.isDisabled ? "gray.300" : "black"}
                    textDecoration={day.isDisabled ? "line-through" : "none"}
                    fontWeight={day.isSelected ? "bold" : "normal"}
                  >
                    {day.date}
                  </Text>
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Box mt={4} p={3} bg="gray.50" borderRadius="md">
        <Text fontSize="sm">
          <strong>Selected:</strong>{" "}
          {selection.selected ? format(selection.selected, "yyyy-MM-dd (EEE)", { locale }) : "None"}
        </Text>
      </Box>
    </Box>
  );
}

// ─── Range Mode ──────────────────────────────────────────

function RangeDemo() {
  const { cursorDate, headers, body, navigation } = useCalendar();
  const selection = useSelection({
    mode: "range",
    body,
    min: 2,
    max: 14,
    disabled: { dayOfWeek: [0] },
  });

  const rangeText = (sel: DateRange | undefined) => {
    if (!sel) return "None";
    const from = format(sel.from, "yyyy-MM-dd");
    if (!sel.to) return `${from} → (pick end date)`;
    const to = format(sel.to, "yyyy-MM-dd");
    const days = Math.round((sel.to.getTime() - sel.from.getTime()) / 86400000) + 1;
    return `${from} → ${to} (${days} days)`;
  };

  return (
    <Box>
      <Text fontSize="sm" color="gray.500" mb={4}>
        Click start → end. Min 2 days, max 14 days. Sundays disabled.
      </Text>
      <Flex justify="space-between" align="center" mb={4}>
        <IconButton aria-label="Previous" icon={<ChevronLeftIcon />} onClick={navigation.toPrev} />
        <Text fontSize="2xl">{format(cursorDate, "yyyy. MM")}</Text>
        <IconButton aria-label="Next" icon={<ChevronRightIcon />} onClick={navigation.toNext} />
      </Flex>
      <Table variant="simple" size="lg">
        <Thead>
          <Tr>
            {headers.weekdays.map(({ key, value }) => (
              <Th key={key}>{format(value, "E", { locale })}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {selection.body.value.map((week) => (
            <Tr key={week.key}>
              {week.value.map((day) => (
                <Td
                  key={day.key}
                  opacity={day.isCurrentMonth ? 1 : 0.2}
                  bg={
                    day.isRangeStart || day.isRangeEnd
                      ? "blue.500"
                      : day.isInRange
                        ? "blue.50"
                        : "transparent"
                  }
                  cursor={day.isDisabled ? "not-allowed" : "pointer"}
                  onClick={() => !day.isDisabled && selection.select(day.value)}
                >
                  <Text
                    textAlign="center"
                    color={
                      day.isRangeStart || day.isRangeEnd
                        ? "white"
                        : day.isDisabled
                          ? "gray.300"
                          : day.isInRange
                            ? "blue.700"
                            : "black"
                    }
                    textDecoration={day.isDisabled ? "line-through" : "none"}
                    fontWeight={day.isRangeStart || day.isRangeEnd ? "bold" : "normal"}
                  >
                    {day.date}
                  </Text>
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Box mt={4} p={3} bg="gray.50" borderRadius="md">
        <Text fontSize="sm">
          <strong>Range:</strong> {rangeText(selection.selected)}
        </Text>
        <Button size="xs" mt={2} onClick={selection.deselect}>
          Reset
        </Button>
      </Box>
    </Box>
  );
}

// ─── Multiple Mode ───────────────────────────────────────

function MultipleDemo() {
  const { cursorDate, headers, body, navigation } = useCalendar();
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const selection = useSelection({
    mode: "multiple",
    body,
    max: 5,
    disabled: (date: Date) => date < today,
  });

  return (
    <Box>
      <Text fontSize="sm" color="gray.500" mb={4}>
        Click to toggle. Max 5 dates. Past dates disabled.
      </Text>
      <Flex justify="space-between" align="center" mb={4}>
        <IconButton aria-label="Previous" icon={<ChevronLeftIcon />} onClick={navigation.toPrev} />
        <Text fontSize="2xl">{format(cursorDate, "yyyy. MM")}</Text>
        <IconButton aria-label="Next" icon={<ChevronRightIcon />} onClick={navigation.toNext} />
      </Flex>
      <Table variant="simple" size="lg">
        <Thead>
          <Tr>
            {headers.weekdays.map(({ key, value }) => (
              <Th key={key}>{format(value, "E", { locale })}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {selection.body.value.map((week) => (
            <Tr key={week.key}>
              {week.value.map((day) => (
                <Td
                  key={day.key}
                  opacity={day.isCurrentMonth ? 1 : 0.2}
                  bg={day.isSelected ? "blue.500" : "transparent"}
                  cursor={day.isDisabled ? "not-allowed" : "pointer"}
                  onClick={() => !day.isDisabled && selection.select(day.value)}
                >
                  <Text
                    textAlign="center"
                    color={day.isSelected ? "white" : day.isDisabled ? "gray.300" : "black"}
                    textDecoration={day.isDisabled ? "line-through" : "none"}
                    fontWeight={day.isSelected ? "bold" : "normal"}
                  >
                    {day.date}
                  </Text>
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Box mt={4} p={3} bg="gray.50" borderRadius="md">
        <Text fontSize="sm">
          <strong>Selected ({selection.selected.length}/5):</strong>{" "}
          {selection.selected.length > 0
            ? selection.selected.map((d) => format(d, "MM/dd")).join(", ")
            : "None"}
        </Text>
      </Box>
    </Box>
  );
}

// ─── Page ────────────────────────────────────────────────

export default function SelectionExample() {
  return (
    <Container height="100vh">
      <Box maxW="640px" m="auto">
        <Stack padding={12} justifyContent="center" direction="column" alignItems="center" spacing={4}>
          <Badge colorScheme="blue" fontSize="1.2em" px={2} textTransform="lowercase">
            useSelection
          </Badge>
          <Heading as="h1" size="xl">
            @h6s/calendar
          </Heading>
          <Text color="gray.500">
            Selection Demo — Single, Range, Multiple
          </Text>
        </Stack>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>Single</Tab>
            <Tab>Range</Tab>
            <Tab>Multiple</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <SingleDemo />
            </TabPanel>
            <TabPanel>
              <RangeDemo />
            </TabPanel>
            <TabPanel>
              <MultipleDemo />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}
