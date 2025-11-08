import { ApiProperty } from '@nestjs/swagger';

class RouteGeometry {
  @ApiProperty({
    description: 'Encoded polyline string representing the route geometry',
    example: 'hckeCbzhcHr@?CiEmJFk@isAmIwWuIeFqDoFq@sIcCMoArDmoA}b@AeD',
  })
  geometry: string;

  @ApiProperty({
    description: 'Distance of the route in kilometers',
    example: 4.553,
  })
  distance: number;

  @ApiProperty({
    description: 'Estimated duration of the route in minutes',
    example: 6,
  })
  duration: number;
}

export class DeliverySimulationResponseDto {
  @ApiProperty({
    description: 'Route information including distance, duration and geometry',
    type: RouteGeometry,
  })
  location: RouteGeometry;

  @ApiProperty({
    description: 'Calculated price for the delivery',
    example: 40.98,
  })
  price: number;
}
