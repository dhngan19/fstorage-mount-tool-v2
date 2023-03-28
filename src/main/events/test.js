const TasklistModule = (async () => {
  const t = await import('tasklist');
  return { ...t };
});

export default TasklistModule;
