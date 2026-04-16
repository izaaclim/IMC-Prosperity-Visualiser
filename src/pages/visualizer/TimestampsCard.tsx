import { ActionIcon, Group, NumberInput, Slider, SliderProps, Text } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { ReactNode, useState } from 'react';
import { AlgorithmDataRow } from '../../models.ts';
import { useStore } from '../../store.ts';
import { formatNumber } from '../../utils/format.ts';
import { TimestampDetail } from './TimestampDetail.tsx';
import { VisualizerCard } from './VisualizerCard.tsx';

export function TimestampsCard(): ReactNode {
  const algorithm = useStore(state => state.algorithm)!;

  const rowsByTimestamp: Record<number, AlgorithmDataRow> = {};
  const timestamps: number[] = [];
  for (const row of algorithm.data) {
    rowsByTimestamp[row.state.timestamp] = row;
    timestamps.push(row.state.timestamp);
  }

  const timestampMin = timestamps[0];
  const timestampMax = timestamps[timestamps.length - 1];
  const timestampStep = timestamps[1] - timestamps[0];

  const [timestamp, setTimestamp] = useState(timestampMin);

  const currentIndex = timestamps.indexOf(timestamp);
  const totalSteps = timestamps.length;

  const goToPrev = () => {
    if (currentIndex > 0) setTimestamp(timestamps[currentIndex - 1]);
  };

  const goToNext = () => {
    if (currentIndex < totalSteps - 1) setTimestamp(timestamps[currentIndex + 1]);
  };

  const marks: SliderProps['marks'] = [];
  for (let i = 0; i <= 4; i++) {
    const val = timestampMin + Math.round((i * (timestampMax - timestampMin)) / 4 / timestampStep) * timestampStep;
    marks.push({ value: val, label: formatNumber(val) });
  }

  useHotkeys([
    ['ArrowLeft', goToPrev],
    ['ArrowRight', goToNext],
  ]);

  return (
    <VisualizerCard title="Timestamps">
      <Group justify="space-between" align="center" mb="xs">
        <Group gap="xs">
          <ActionIcon onClick={goToPrev} disabled={currentIndex <= 0} variant="subtle" size="sm">
            <IconChevronLeft size={16} />
          </ActionIcon>
          <Text fw={600}>Timestamp {formatNumber(timestamp)}</Text>
          <ActionIcon onClick={goToNext} disabled={currentIndex >= totalSteps - 1} variant="subtle" size="sm">
            <IconChevronRight size={16} />
          </ActionIcon>
        </Group>
        <Group gap="sm" align="flex-end">
          <Text size="sm" c="dimmed">
            Step {currentIndex + 1} / {totalSteps}
          </Text>
          <NumberInput
            size="xs"
            w={130}
            label="Jump to timestamp"
            min={timestampMin}
            max={timestampMax}
            step={timestampStep}
            value={timestamp}
            onChange={val => {
              const num = Number(val);
              if (rowsByTimestamp[num] !== undefined) setTimestamp(num);
            }}
          />
        </Group>
      </Group>

      <Slider
        min={timestampMin}
        max={timestampMax}
        step={timestampStep}
        marks={marks}
        label={value => `Timestamp ${formatNumber(value)}`}
        value={timestamp}
        onChange={setTimestamp}
        mb="xl"
      />

      {rowsByTimestamp[timestamp] ? (
        <TimestampDetail row={rowsByTimestamp[timestamp]} />
      ) : (
        <Text>No logs found for timestamp {formatNumber(timestamp)}</Text>
      )}
    </VisualizerCard>
  );
}
