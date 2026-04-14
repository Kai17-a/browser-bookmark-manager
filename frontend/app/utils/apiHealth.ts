export type ApiHealthState = {
  checked: boolean;
  ok: boolean | null;
};

export const createApiHealthState = (): ApiHealthState => ({
  checked: false,
  ok: null,
});

