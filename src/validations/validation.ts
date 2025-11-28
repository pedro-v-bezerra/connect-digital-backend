export function validateEnv(config: Record<string, unknown>) {
  const required = [
    'ABACATEPAY_BASE_URL',
    'ABACATEPAY_API_KEY',
    'EVOLUTION_BASE_URL',
    'EVOLUTION_API_KEY',
    'EVOLUTION_INSTANCE_NAME',
  ];

  for (const key of required) {
    if (!config[key]) {
      throw new Error(`Missing env variable: ${key}`);
    }
  }

  return config;
}
