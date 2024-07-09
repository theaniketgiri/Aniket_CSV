import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received data:', body); // Log received data

    if (!body.data || !Array.isArray(body.data)) {
      throw new Error('Invalid data format: expected an array');
    }

    const importedData = await Promise.all(
      body.data.map(async (item) => {
        return await prisma.dynamicData.create({
          data: {
            data: item,
          },
        });
      })
    );

    return NextResponse.json({ message: 'Data imported successfully', count: importedData.length }, { status: 200 });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ message: 'Error importing data: ' + (error as Error).message }, { status: 400 });
  }
}