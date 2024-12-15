package de.tmosebach.slowen.api.conf;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;

import graphql.schema.GraphQLScalarType;


@Configuration
public class ScalarConfig {

    public static final GraphQLScalarType DateScalar = GraphQLScalarType.newScalar()
            .name("Date")
            .description("Ein Datum im Format 'jjjj-mm-dd'")
            .coercing(new DateCoercing())
            .build();
    @Bean
    RuntimeWiringConfigurer runtimeWiringConfigurer() {
        return builder -> builder.scalar(DateScalar);
    }
}
