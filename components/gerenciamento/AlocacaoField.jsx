import React from 'react';
import { useFieldArray, Controller } from 'react-hook-form';
import { Box, Button, TextField, Typography, IconButton, Grid, Paper, Autocomplete } from '@mui/material';
import { AddCircleOutline, DeleteOutline } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';

const AlocacaoField = ({ control, index, remove, recursosOptions, handleRecursoSearch, errors }) => {
    const { fields, append, remove: removeHora } = useFieldArray({
        control,
        name: `alocacoes[${index}].horas_planejadas`
    });

    return (
        <Paper sx={{ p: 2, mb: 2, position: 'relative' }}>
            <IconButton
                aria-label="delete"
                onClick={() => remove(index)}
                sx={{ position: 'absolute', top: 8, right: 8 }}
            >
                <DeleteOutline />
            </IconButton>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Controller
                        name={`alocacoes[${index}].recurso`}
                        control={control}
                        render={({ field }) => (
                            <Autocomplete
                                {...field}
                                options={recursosOptions}
                                getOptionLabel={(option) => option.nome || ''}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                onInputChange={handleRecursoSearch}
                                onChange={(_, data) => field.onChange(data)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Recurso"
                                        variant="outlined"
                                        error={!!errors.alocacoes?.[index]?.recurso}
                                        helperText={errors.alocacoes?.[index]?.recurso?.message}
                                    />
                                )}
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={6}>
                    <Controller
                        name={`alocacoes[${index}].data_inicio_alocacao`}
                        control={control}
                        render={({ field }) => (
                            <DatePicker
                                label="Início da Alocação"
                                value={field.value}
                                onChange={(date) => field.onChange(date)}
                                renderInput={(params) => <TextField {...params} fullWidth error={!!errors.alocacoes?.[index]?.data_inicio_alocacao} helperText={errors.alocacoes?.[index]?.data_inicio_alocacao?.message} />}
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={6}>
                    <Controller
                        name={`alocacoes[${index}].data_fim_alocacao`}
                        control={control}
                        render={({ field }) => (
                            <DatePicker
                                label="Fim da Alocação"
                                value={field.value}
                                onChange={(date) => field.onChange(date)}
                                renderInput={(params) => <TextField {...params} fullWidth error={!!errors.alocacoes?.[index]?.data_fim_alocacao} helperText={errors.alocacoes?.[index]?.data_fim_alocacao?.message} />}
                            />
                        )}
                    />
                </Grid>
            </Grid>

            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Horas Planejadas</Typography>
            {fields.map((hora, horaIndex) => (
                <Grid container spacing={1} key={hora.id} sx={{ mb: 1, alignItems: 'center' }}>
                    <Grid item xs={4}>
                         <Controller
                            name={`alocacoes[${index}].horas_planejadas[${horaIndex}].ano`}
                            control={control}
                            render={({ field }) => <TextField {...field} label="Ano" type="number" fullWidth error={!!errors.alocacoes?.[index]?.horas_planejadas?.[horaIndex]?.ano} />}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <Controller
                            name={`alocacoes[${index}].horas_planejadas[${horaIndex}].mes`}
                            control={control}
                            render={({ field }) => <TextField {...field} label="Mês" type="number" fullWidth error={!!errors.alocacoes?.[index]?.horas_planejadas?.[horaIndex]?.mes} />}
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <Controller
                            name={`alocacoes[${index}].horas_planejadas[${horaIndex}].horas_planejadas`}
                            control={control}
                            render={({ field }) => <TextField {...field} label="Horas" type="number" fullWidth error={!!errors.alocacoes?.[index]?.horas_planejadas?.[horaIndex]?.horas_planejadas} />}
                        />
                    </Grid>
                    <Grid item xs={1}>
                        <IconButton onClick={() => removeHora(horaIndex)}><DeleteOutline /></IconButton>
                    </Grid>
                </Grid>
            ))}
            <Button size="small" startIcon={<AddCircleOutline />} onClick={() => append({ ano: new Date().getFullYear(), mes: new Date().getMonth() + 1, horas_planejadas: 0 })}>
                Adicionar Mês
            </Button>
        </Paper>
    );
};

export default AlocacaoField;
