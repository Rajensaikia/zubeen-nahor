import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const allApproved = await prisma.plantationRecord.findMany({
      where: { status: 'APPROVED' },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Group records by district
    const districtData: Record<
      string,
      {
        district: string;
        treeCount: number;
        recordCount: number;
        contributors: Set<string>;
        speciesBreakdown: Record<string, number>;
        recentRecords: any[];
      }
    > = {};

    let totalTrees = 0;
    const overallContributors = new Set<string>();
    const overallSpecies: Record<string, number> = {};

    allApproved.forEach((record) => {
      const distKey = record.district.toLowerCase().trim();

      if (!districtData[distKey]) {
        districtData[distKey] = {
          district: record.district,
          treeCount: 0,
          recordCount: 0,
          contributors: new Set<string>(),
          speciesBreakdown: {},
          recentRecords: [],
        };
      }

      const dist = districtData[distKey];
      dist.treeCount += record.treeCount;
      dist.recordCount += 1;
      dist.contributors.add(record.userId);

      totalTrees += record.treeCount;
      overallContributors.add(record.userId);

      // Species handling (supports comma-separated values like 'Nahor, Bakul')
      const speciesList = record.species
        ? record.species
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      // Divide tree count equally if multiple species are specified
      const treesPerSpecies =
        speciesList.length > 0 ? Math.ceil(record.treeCount / speciesList.length) : record.treeCount;

      speciesList.forEach((s) => {
        const spKey = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

        dist.speciesBreakdown[spKey] = (dist.speciesBreakdown[spKey] || 0) + treesPerSpecies;
        overallSpecies[spKey] = (overallSpecies[spKey] || 0) + treesPerSpecies;
      });

      if (dist.recentRecords.length < 5) {
        dist.recentRecords.push({
          id: record.id,
          name: record.name,
          village: record.village,
          location: record.location,
          treeCount: record.treeCount,
          species: record.species,
          date: record.date.toISOString(),
          notes: record.notes,
          imageUrl: record.imageUrl,
          user: record.user
            ? {
                displayName: record.user.displayName,
                username: record.user.username,
                avatarUrl: record.user.avatarUrl,
              }
            : null,
        });
      }
    });

    const formattedStats = Object.values(districtData).map((d) => ({
      district: d.district,
      treeCount: d.treeCount,
      recordCount: d.recordCount,
      contributorCount: d.contributors.size,
      speciesBreakdown: Object.entries(d.speciesBreakdown)
        .map(([species, count]) => ({ species, count }))
        .sort((a, b) => b.count - a.count),
      recentRecords: d.recentRecords,
    }));

    const overallStats = {
      totalTrees,
      totalContributors: overallContributors.size,
      totalDistricts: Object.keys(districtData).length,
      recentActivity: allApproved.slice(0, 10).map((record) => ({
        id: record.id,
        name: record.name,
        district: record.district,
        village: record.village,
        treeCount: record.treeCount,
        species: record.species,
        date: record.date.toISOString(),
        imageUrl: record.imageUrl,
        user: record.user
          ? {
              displayName: record.user.displayName,
              username: record.user.username,
              avatarUrl: record.user.avatarUrl,
            }
          : null,
      })),
      speciesStats: Object.entries(overallSpecies)
        .map(([species, count]) => ({ species, count }))
        .sort((a, b) => b.count - a.count),
    };

    return NextResponse.json({ stats: formattedStats, overall: overallStats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

