import React from 'react';

interface OrderNumberProps {
  name: string;
  type: 'Receipt' | 'Delivery';
  gatePassNumber?: number;
}

export const OrderNumber: React.FC<OrderNumberProps> = ({ name, type, gatePassNumber }) => {
  const message = 'Please select a commodity to generate a gate pass number.';

  // Determine text color based on type
  const colorClass =
    type === 'Receipt' ? 'text-primary' : type === 'Delivery' ? 'text-destructive' : '';

  return (
    <div>
      <h1 className="text-lg font-bold">
        {gatePassNumber === undefined ? (
          message
        ) : (
          <>
            {type} {name} <span className={`${colorClass} ml-0.5 font-bold`}>{gatePassNumber}</span>
          </>
        )}
      </h1>
    </div>
  );
};
