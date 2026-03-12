import { Stack, Card, CardHeader, CardContent, Checkbox, Radio, Typography, Box, Chip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useUVLModel } from "../hooks/useUVLModel";

const GROUPS = [
  { key: "MANDATORY", title: null },
  { key: "ALTERNATIVE", title: "Alternative (Select exactly one)", controlType: "radio", color: "primary" },
  { key: "OR", title: "OR (Select at least one)", controlType: "checkbox", color: "primary" },
  { key: "OPTIONAL", title: "Optional Features", controlType: "checkbox", color: "secondary" }
];

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  fontWeight: "bold",
  textTransform: "uppercase",
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(2),
  letterSpacing: "0.05em"
}));

function FeatureItem({ child, control, active, depth }) {
  const hasChildren = child.children?.length > 0;

  return (
    <Box sx={{ pl: depth * 2 }}>
      <Card
        variant="outlined"
        sx={{
          mb: 1,
          borderColor: active ? "primary.main" : "divider"
        }}
      >
        <CardHeader
          sx={{ py: 1 }}
          title={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {control}
              <Typography
                variant="body2"
                fontWeight={active ? "bold" : "normal"}
                sx={{ ml: 1 }}
              >
                {child.name}
              </Typography>
            </Box>
          }
        />

        {active && hasChildren && (
          <CardContent sx={{ pt: 0 }}>
            <FeatureNode node={child} depth={depth + 1} />
          </CardContent>
        )}
      </Card>
    </Box>
  );
}

export default function FeatureNode({ node, depth = 0 }) {
  const { isActive, handleToggle, handleRadioChange, readOnly } = useUVLModel();

  if (!node.children?.length) return null;

  const groupedChildren = node.children.reduce((acc, child) => {
    const rel = child.relationship;
    if (!acc[rel]) acc[rel] = [];
    acc[rel].push(child);
    return acc;
  }, {});

  return (
    <Stack spacing={1}>
      {GROUPS.map(({ key, title, controlType, color }) => {
        const children = groupedChildren[key];
        if (!children) return null;

        if (key === "MANDATORY") {
          return children.map(child => (
            <Card key={child.name} variant="outlined" sx={{ bgcolor: "background.default" }}>
              <CardHeader sx={{color:"primary.main"}}
                title={child.name}
              />
              <CardContent sx={{ pt: 0 }}>
                <FeatureNode node={child} depth={depth + 1} />
              </CardContent>
            </Card>
          ));
        }

        return (
          <Stack key={key}  >
            

            {children.map(child => {
              const active = isActive(child.name);

              let control = null;

              if (controlType === "radio") {
                control = (
                  <Radio
                    size="small"
                    checked={active}
                    disabled={readOnly}
                    onClick={() => handleRadioChange(children, child)}
                    color={color}
                  />
                );
              }

              if (controlType === "checkbox") {
                const checkedCount = children.filter(c => isActive(c.name)).length;
                const disabled =
                  key === "OR" && active && checkedCount === 1 || readOnly;

                control = (
                  <Checkbox
                    size="small"
                    checked={active}
                    disabled={disabled}
                    onChange={() => handleToggle(child)}
                    color={color}
                  />
                );
              }

              return (
                <FeatureItem
                  key={child.name}
                  child={child}
                  control={control}
                  active={active}
                  depth={depth}
                />
              );
            })}
          </Stack>
        );
      })}
    </Stack>
  );
}