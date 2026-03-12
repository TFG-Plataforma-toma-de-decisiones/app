import { Grid, Card, CardHeader, CardContent, Chip, Radio, Checkbox, Typography,Box } from '@mui/material';
 import { styled } from '@mui/material/styles';
import { useUVLModel } from '../hooks/useUVLModel';
const GROUPS = [
    { key: 'MANDATORY', title: null, controlType: null, subtitle: null },
    { key: 'ALTERNATIVE', title: 'Alternative (Select exactly one)', controlType: 'radio', color: 'primary' },
    { key: 'OR', title: 'OR (Select at least one)', controlType: 'checkbox', color: 'primary' },
    { key: 'OPTIONAL', title: 'Optional Features', controlType: 'checkbox', color: 'secondary' }
  ];
  const SectionSubtitle = styled(Typography)(({ theme }) => ({
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(2),
    letterSpacing: '0.05em',
    width: '100%'
  }));
  function FeatureCard({ child, control, isActive, color = 'primary' }) {
    const hasChildren = child.children && child.children.length > 0;
    const isExpanded = isActive && hasChildren;
  
    return (
      <Grid item xs={isExpanded ? 12 : 6} md={isExpanded ? 12 : 3}>
        <Card variant="outlined" sx={{ borderColor: isActive ? `${color}.main` : 'divider' }}>
          <CardHeader
            sx={{ p: 1.5 }}
            title={
              <FormControlLabel
                control={control}
                label={
                  <Typography variant="body2" fontWeight={isActive ? 'bold' : 'normal'} sx={{ wordBreak: 'break-word' }}>
                    {child.name}
                  </Typography>
                }
                sx={{ m: 0, width: '100%' }}
              />
            }
          />
          {isExpanded && (
            <CardContent sx={{ pt: 0, borderTop: 1, borderColor: 'divider' }}>
              <FeatureNode node={child} />
            </CardContent>
          )}
        </Card>
      </Grid>
    );
  }
export default function FeatureNode({ node }) {
    const { isActive, handleToggle, handleRadioChange,readOnly } = useUVLModel();
  
    if (!node.children || node.children.length === 0) return null;
  
    const groupedChildren = node.children.reduce((acc, child) => {
      const rel = child.relationship;
      if (!acc[rel]) acc[rel] = [];
      acc[rel].push(child);
      return acc;
    }, {});
  
    return (
      <Grid container spacing={2} sx={{ mt: 0 }}>
        {GROUPS.map(({ key, title, controlType, color }) => {
          const children = groupedChildren[key];
          if (!children || children.length === 0) return null;
          if (key === 'MANDATORY') {
            return children.map(child => (
              <Grid item xs={12} key={child.name}>
                <Card variant="outlined" sx={{ height: '100%', borderColor: 'divider', bgcolor: 'background.default' }}>
                  <CardHeader
                    title={child.name}
                    titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                    avatar={<Chip label="Required" size="small" color="primary" variant="outlined" />}
                    sx={{ pb: 1 }}
                  />
                  <CardContent sx={{ pt: 0 }}>
                    <FeatureNode node={child} />
                  </CardContent>
                </Card>
              </Grid>
            ));
          }
  

          return (
            <Grid item xs={12} key={key}>
              {title && <SectionSubtitle>{title}</SectionSubtitle>}
              <Grid container spacing={2}>
                {children.map(child => {
                  const active = isActive(child.name);
  
                  let control = null;
                  if (controlType === 'radio') {
                    control = (
                      <Radio
                        size="small"
                        color={color}
                        checked={active}
                        disabled={readOnly}
                        onClick={() => handleRadioChange(children, child)}
                      />
                    );
                  } else if (controlType === 'checkbox') {
                    const checkedCount = children.filter(c => isActive(c.name)).length;
                    const disabled = controlType === 'checkbox' && key === 'OR' && active && checkedCount === 1 || readOnly;
  
                    control = (
                      <Checkbox
                        size="small"
                        checked={active}
                        onChange={() => handleToggle(child)}
                        disabled={disabled}
                        color={color}
                      />
                    );
                  }
  
                  return (
                    <FeatureCard
                      key={child.name}
                      child={child}
                      isActive={active}
                      color={color}
                      control={control}
                    />
                  );
                })}
              </Grid>
            </Grid>
          );
        })}
      </Grid>
    );
  }
  function FormControlLabel({ control, label, sx }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', ...sx }}>
            {control}
            <Box sx={{ ml: 1, flexGrow: 1 }}>{label}</Box>
        </Box>
    );
}