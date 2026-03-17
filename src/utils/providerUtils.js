export function calculateDistribution(providers, totalMessages, totalPercentage) {
  if (totalPercentage !== 100) {
    return []
  }

  return providers.map((provider) => ({
    ...provider,
    messages: Math.round((totalMessages * provider.percentage) / 100),
  }))
}
