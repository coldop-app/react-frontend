import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { VarietyAnalysisSize } from '@/types/analytics';

interface SizeTableProps {
  sizes: VarietyAnalysisSize[];
  showInitial?: boolean;
  showOutgoing?: boolean;
}

export function SizeTable({ sizes, showInitial = true, showOutgoing = true }: SizeTableProps) {
  const sortedSizes = [...sizes].sort((a, b) => b.totalCurrent - a.totalCurrent);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Size</TableHead>
            {showInitial && <TableHead className="text-right">Initial</TableHead>}
            <TableHead className="text-right">Current</TableHead>
            {showOutgoing && <TableHead className="text-right">Outgoing</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSizes.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={showInitial && showOutgoing ? 4 : showInitial || showOutgoing ? 3 : 2}
                className="text-center text-muted-foreground"
              >
                No sizes available
              </TableCell>
            </TableRow>
          ) : (
            sortedSizes.map((size) => (
              <TableRow key={size.size}>
                <TableCell className="font-medium">{size.size}</TableCell>
                {showInitial && (
                  <TableCell className="text-right">{size.totalInitial.toLocaleString()}</TableCell>
                )}
                <TableCell className="text-right font-medium">
                  {size.totalCurrent.toLocaleString()}
                </TableCell>
                {showOutgoing && (
                  <TableCell className="text-right text-muted-foreground">
                    {size.totalOutgoing.toLocaleString()}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
